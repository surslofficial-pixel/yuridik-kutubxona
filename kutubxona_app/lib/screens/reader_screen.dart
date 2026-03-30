import 'dart:async';
import 'dart:io' show Platform;
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/foundation.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
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

  // YouTube
  YoutubePlayerController? _ytController;
  bool _isYouTube = false;
  String _youtubeVideoId = '';

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
          _previewUrl =
              'https://drive.google.com/file/d/${fileMatch.group(1)}/preview';
        } else {
          _previewUrl = rawUrl;
        }
      } else if (rawUrl.contains('youtube.com') ||
          rawUrl.contains('youtu.be')) {
        _youtubeVideoId = YoutubePlayer.convertUrlToId(rawUrl) ?? '';
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

    // Init controllers only for mobile
    if (_isSupportedPlatform) {
      if (_isYouTube) {
        _ytController = YoutubePlayerController(
          initialVideoId: _youtubeVideoId,
          flags: const YoutubePlayerFlags(
            autoPlay: false,
            mute: false,
            enableCaption: false,
          ),
        );
      } else {
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
    if (_activeReaderId.isNotEmpty) {
      _firebase.removeActiveReader(_activeReaderId);
    }
    _ytController?.dispose();
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
    if (_previewUrl.isEmpty) {
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

    return YoutubePlayerBuilder(
      player: YoutubePlayer(
        controller: _ytController!,
        showVideoProgressIndicator: true,
        progressIndicatorColor: const Color(0xFF3B82F6),
        progressColors: const ProgressBarColors(
          playedColor: Color(0xFF3B82F6),
          handleColor: Color(0xFF3B82F6),
        ),
      ),
      builder: (context, player) {
        return Column(
          children: [
            // Cover + vinyl disc
            Expanded(
              child: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                  ),
                ),
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Vinyl disc
                      Container(
                        width: 200,
                        height: 200,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: const Color(0xFF334155),
                            width: 5,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.5),
                              blurRadius: 30,
                            ),
                          ],
                        ),
                        clipBehavior: Clip.antiAlias,
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            CachedNetworkImage(
                              imageUrl: widget.book.cover,
                              fit: BoxFit.cover,
                              width: 200,
                              height: 200,
                              placeholder: (c, url) => Container(
                                color: const Color(0xFF334155),
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
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: const Color(0xFF0F172A),
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: const Color(0xFF334155),
                                  width: 2,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                      // Title
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 32),
                        child: Text(
                          widget.book.title,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Kitob ovozlashtirilgan fonda ijro etilmoqda',
                        style: TextStyle(
                          fontSize: 13,
                          color: Color(0xFF94A3B8),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            // Player
            player,
          ],
        );
      },
    );
  }
}
