import 'dart:async';
import 'dart:io' show Platform;
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/foundation.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:youtube_player_iframe/youtube_player_iframe.dart';
import '../models/book.dart';
import '../services/firebase_service.dart';
import '../theme/app_theme.dart';
import '../widgets/iframe_web_view.dart';

class ReaderScreen extends StatefulWidget {
  final Book book;
  final String firstName;
  final String lastName;
  final String groupName;

  const ReaderScreen({
    super.key,
    required this.book,
    required this.firstName,
    required this.lastName,
    required this.groupName,
  });

  @override
  State<ReaderScreen> createState() => _ReaderScreenState();
}

class _ReaderScreenState extends State<ReaderScreen> {
  final _firebase = FirebaseService();
  String _activeReaderId = '';
  Timer? _heartbeat;
  bool _darkMode = false;

  // WebView
  WebViewController? _webViewCtrl;

  // YouTube (custom WebView-based audio engine)
  YoutubePlayerController? _ytController;
  bool _isYouTube = false;
  String _youtubeVideoId = '';
  bool _ytPlaying = false;
  Duration _ytPosition = Duration.zero;
  Duration _ytDuration = Duration.zero;
  Timer? _ytProgressTimer;

  // URLs
  String _previewUrl = '';

  bool get _isSupportedPlatform {
    if (kIsWeb) return true;
    try {
      return Platform.isAndroid || Platform.isIOS;
    } catch (_) {
      return false;
    }
  }

  @override
  void initState() {
    super.initState();
    _resolveUrls();
    _registerReader();
  }

  void _resolveUrls() {
    final book = widget.book;
    final rawUrl = book.driveUrl?.trim() ?? '';
    final fid = book.fileId?.trim() ?? '';
    final isAudio =
        book.categorySlug == 'audio-kitoblar' ||
        book.category == 'Audio Darslik';

    if (rawUrl.isNotEmpty) {
      if (rawUrl.contains('drive.google.com')) {
        final folderMatch = RegExp(
          r'/folders/([a-zA-Z0-9_-]+)',
        ).firstMatch(rawUrl);
        final fileMatch =
            RegExp(r'/file/d/([a-zA-Z0-9_-]+)').firstMatch(rawUrl) ??
            RegExp(r'[?&]id=([a-zA-Z0-9_-]+)').firstMatch(rawUrl);

        if (folderMatch != null) {
          _previewUrl =
              'https://drive.google.com/drive/folders/${folderMatch.group(1)}?usp=sharing';
        } else if (fileMatch != null) {
          final fileId = fileMatch.group(1)!;
          if (isAudio && !_isYouTube) {
            _previewUrl =
                'https://docs.google.com/uc?export=download&id=$fileId';
          } else {
            _previewUrl = 'https://drive.google.com/file/d/$fileId/preview';
          }
        } else {
          _previewUrl = rawUrl;
        }
      } else if (rawUrl.contains('youtube.com') ||
          rawUrl.contains('youtu.be')) {
        final ytMatch = RegExp(
          r'(?:youtu\.be/|youtube\.com/(?:watch\?v=|embed/|v/))([a-zA-Z0-9_-]{11})',
        ).firstMatch(rawUrl);
        _youtubeVideoId = ytMatch?.group(1) ?? '';
        _isYouTube = _youtubeVideoId.isNotEmpty;
      } else {
        _previewUrl = rawUrl;
      }
    }

    if (_previewUrl.isEmpty && !_isYouTube && fid.isNotEmpty) {
      if (fid.length == 11) {
        _youtubeVideoId = fid;
        _isYouTube = true;
      } else if (isAudio) {
        _previewUrl = 'https://docs.google.com/uc?export=download&id=$fid';
      } else {
        _previewUrl = 'https://drive.google.com/file/d/$fid/preview?rm=minimal';
      }
    }

    if (_isYouTube) {
      _ytController = YoutubePlayerController.fromVideoId(
        videoId: _youtubeVideoId,
        autoPlay: true,
        params: const YoutubePlayerParams(
          showControls: false,
          showFullscreenButton: false,
          mute: false,
          playsInline: true,
        ),
      );
      _ytController!.listen((event) {
        if (mounted) {
          setState(() {
            _ytPlaying = event.playerState == PlayerState.playing;
          });
        }
      });
      _ytProgressTimer = Timer.periodic(const Duration(milliseconds: 1000), (
        timer,
      ) async {
        if (!mounted || _ytController == null) {
          timer.cancel();
          return;
        }
        try {
          final pos = await _ytController!.currentTime;
          final dur = await _ytController!.duration;
          if (mounted) {
            final newPos = Duration(milliseconds: (pos * 1000).toInt());
            final newDur = dur > 0
                ? Duration(milliseconds: (dur * 1000).toInt())
                : _ytDuration;
            // Only rebuild if values actually changed
            if (newPos != _ytPosition || newDur != _ytDuration) {
              setState(() {
                _ytPosition = newPos;
                _ytDuration = newDur;
              });
            }
          }
        } catch (_) {
          // Player not ready yet, skip this tick
        }
      });
    }

    // Init controllers only for mobile
    if (_isSupportedPlatform && !kIsWeb) {
      if (!_isYouTube) {
        if (!kIsWeb) {
          final ctrl = WebViewController();
          ctrl.setJavaScriptMode(JavaScriptMode.unrestricted);
          if (isAudio && !_isYouTube) {
            final htmlContent =
                '''
            <!DOCTYPE html>
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                  body {
                    background-color: #0f172a;
                    color: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    padding: 20px;
                    box-sizing: border-box;
                    font-family: system-ui, sans-serif;
                  }
                  .player-card {
                    background: #1e293b;
                    padding: 30px;
                    border-radius: 20px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                    text-align: center;
                    width: 100%;
                    max-width: 400px;
                  }
                  audio {
                    width: 100%;
                    margin-top: 20px;
                    outline: none;
                    border-radius: 10px;
                  }
                  .title {
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin-top: 20px;
                    color: #f8fafc;
                  }
                  .spining-disc {
                    width: 150px;
                    height: 150px;
                    border-radius: 50%;
                    background: conic-gradient(from 0deg, #3b82f6, #1e40af, #3b82f6);
                    margin: 0 auto;
                    animation: spin 10s linear infinite;
                    border: 8px solid #0f172a;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    position: relative;
                  }
                  .spining-disc::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 30px;
                    height: 30px;
                    background: #0f172a;
                    border-radius: 50%;
                  }
                  @keyframes spin { 100% { transform: rotate(360deg); } }
                </style>
              </head>
              <body>
                <div class="player-card">
                  <div class="spining-disc"></div>
                  <div class="title">Audio Darslik Efirda</div>
                  <audio controls autoplay src="$_previewUrl"></audio>
                </div>
              </body>
            </html>
            ''';
            ctrl.loadHtmlString(htmlContent);
          } else {
            ctrl.loadRequest(
              Uri.parse(_previewUrl.isNotEmpty ? _previewUrl : 'about:blank'),
            );
          }
          _webViewCtrl = ctrl;
        }
      }
    }
  }

  Future<void> _registerReader() async {
    final id = await _firebase.setActiveReader(
      firstName: widget.firstName,
      lastName: widget.lastName,
      groupName: widget.groupName,
      bookId: widget.book.id,
    );
    _activeReaderId = id;
    _heartbeat = Timer.periodic(const Duration(minutes: 2), (_) {
      if (_activeReaderId.isNotEmpty) {
        _firebase.updateActiveReaderTimestamp(_activeReaderId);
      }
    });
  }

  @override
  void dispose() {
    _heartbeat?.cancel();
    _ytProgressTimer?.cancel();
    _ytController?.close();
    if (_activeReaderId.isNotEmpty) {
      _firebase.removeActiveReader(_activeReaderId);
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _darkMode
          ? const Color(0xFF0F172A)
          : AppTheme.surfaceLight,
      appBar: AppBar(
        backgroundColor: _darkMode ? const Color(0xFF1E293B) : Colors.white,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back,
            color: _darkMode ? Colors.white70 : AppTheme.textPrimary,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          widget.book.title,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: _darkMode ? Colors.white : AppTheme.textPrimary,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        actions: [
          if (!_isYouTube)
            IconButton(
              icon: Icon(
                _darkMode ? Icons.light_mode : Icons.dark_mode,
                color: _darkMode ? Colors.white70 : null,
              ),
              onPressed: () => setState(() => _darkMode = !_darkMode),
            ),
        ],
      ),
      body: _isYouTube ? _buildYouTubePlayer() : _buildWebView(),
    );
  }

  Widget _buildWebView() {
    if (_previewUrl.isEmpty && !_isYouTube) {
      return const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline, size: 48, color: Colors.grey),
            SizedBox(height: 12),
            Text(
              "Fayl topilmadi",
              style: TextStyle(fontSize: 16, color: AppTheme.textSecondary),
            ),
          ],
        ),
      );
    }

    if (!_isSupportedPlatform) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.open_in_browser, size: 60, color: Colors.grey),
            const SizedBox(height: 16),
            const Text(
              "Faylni brauzerda ochish",
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => launchUrl(Uri.parse(_previewUrl)),
              icon: const Icon(Icons.open_in_new),
              label: const Text("Brauzerda ochish"),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 14,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ],
        ),
      );
    }

    if (kIsWeb) {
      if (_isYouTube) {
        return buildIframeWebView(
          'https://www.youtube.com/embed/$_youtubeVideoId',
        );
      }
      final isAudio =
          widget.book.categorySlug == 'audio-kitoblar' ||
          widget.book.format == 'Audio';
      if (isAudio) {
        return buildHtmlAudioPlayer(_previewUrl, widget.book.title);
      }
      return buildIframeWebView(_previewUrl);
    }
    return WebViewWidget(controller: _webViewCtrl!);
  }

  Widget _buildYouTubePlayer() {
    if (!_isSupportedPlatform) {
      final watchUrl = 'https://www.youtube.com/watch?v=$_youtubeVideoId';
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.open_in_browser, size: 60, color: Colors.grey),
            const SizedBox(height: 16),
            const Text(
              "Audio darslikni brauzerda eshitish",
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => launchUrl(Uri.parse(watchUrl)),
              icon: const Icon(Icons.open_in_new),
              label: const Text("YouTube'da ochish"),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 14,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ],
        ),
      );
    }
    if (_ytController == null) return const SizedBox.shrink();
    String fmt(Duration d) =>
        '${d.inMinutes}:${(d.inSeconds % 60).toString().padLeft(2, '0')}';
    return Stack(
      children: [
        // Custom Audio-only UI
        Positioned.fill(
          child: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Color(0xFF0C1E18), Color(0xFF091118)],
              ),
            ),
            child: SafeArea(
              bottom: true,
              top: false,
              child: Column(
                children: [
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(top: 64),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 170,
                            height: 170,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.4),
                                  blurRadius: 30,
                                  offset: const Offset(0, 15),
                                ),
                              ],
                            ),
                            clipBehavior: Clip.antiAlias,
                            child: CachedNetworkImage(
                              imageUrl: widget.book.cover,
                              fit: BoxFit.cover,
                              placeholder: (c, url) => Container(
                                color: const Color(0xFF1E293B),
                                child: const Center(
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                ),
                              ),
                              errorWidget: (c, url, error) => Container(
                                color: Colors.grey[800],
                                child: const Icon(
                                  Icons.broken_image,
                                  color: Colors.white54,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 24),
                            child: Text(
                              widget.book.title,
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                              textAlign: TextAlign.center,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            widget.book.author.isNotEmpty
                                ? widget.book.author
                                : "Audio darslik",
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.white.withValues(alpha: 0.6),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 16,
                    ),
                    child: Column(
                      children: [
                        SliderTheme(
                          data: SliderTheme.of(context).copyWith(
                            trackHeight: 4,
                            thumbShape: const RoundSliderThumbShape(
                              enabledThumbRadius: 8,
                            ),
                            overlayShape: const RoundSliderOverlayShape(
                              overlayRadius: 16,
                            ),
                            activeTrackColor: AppTheme.primaryBlue,
                            inactiveTrackColor: Colors.white.withValues(
                              alpha: 0.2,
                            ),
                            thumbColor: Colors.white,
                          ),
                          child: Slider(
                            value: _ytPosition.inSeconds.toDouble().clamp(
                              0,
                              _ytDuration.inSeconds > 0
                                  ? _ytDuration.inSeconds.toDouble()
                                  : 1,
                            ),
                            min: 0,
                            max: _ytDuration.inSeconds > 0
                                ? _ytDuration.inSeconds.toDouble()
                                : 1,
                            onChanged: (val) => _ytController!.seekTo(
                              seconds: val,
                              allowSeekAhead: true,
                            ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 6),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                fmt(_ytPosition),
                                style: TextStyle(
                                  color: Colors.white.withValues(alpha: 0.5),
                                  fontSize: 12,
                                ),
                              ),
                              Text(
                                fmt(_ytDuration),
                                style: TextStyle(
                                  color: Colors.white.withValues(alpha: 0.5),
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.shuffle),
                              color: Colors.white.withValues(alpha: 0.5),
                              iconSize: 24,
                              onPressed: () {},
                            ),
                            IconButton(
                              icon: const Icon(Icons.skip_previous),
                              color: Colors.white,
                              iconSize: 36,
                              onPressed: () {
                                if (_ytPosition > const Duration(seconds: 5)) {
                                  _ytController!.seekTo(
                                    seconds: 0,
                                    allowSeekAhead: true,
                                  );
                                }
                              },
                            ),
                            GestureDetector(
                              onTap: () {
                                if (_ytPlaying) {
                                  _ytController!.pauseVideo();
                                } else {
                                  _ytController!.playVideo();
                                }
                              },
                              child: Container(
                                width: 72,
                                height: 72,
                                decoration: const BoxDecoration(
                                  color: AppTheme.primaryBlue,
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black26,
                                      blurRadius: 10,
                                      offset: Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: Icon(
                                  _ytPlaying ? Icons.pause : Icons.play_arrow,
                                  color: Colors.white,
                                  size: 42,
                                ),
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.skip_next),
                              color: Colors.white,
                              iconSize: 36,
                              onPressed: () {},
                            ),
                            IconButton(
                              icon: const Icon(Icons.repeat),
                              color: Colors.white.withValues(alpha: 0.5),
                              iconSize: 24,
                              onPressed: () {},
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        // YouTube iframe ON TOP of the opaque gradient, which avoids Chromium's occlusion detection.
        // Opacity 0.01 makes it practically invisible while preventing the WebView from pausing.
        Positioned(
          left: 0,
          top: 0,
          width: 320,
          height: 240,
          child: Opacity(
            opacity: 0.01,
            child: IgnorePointer(
              child: YoutubePlayer(controller: _ytController!),
            ),
          ),
        ),
      ],
    );
  }
}
