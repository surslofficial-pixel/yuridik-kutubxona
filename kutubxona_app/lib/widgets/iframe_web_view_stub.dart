import 'package:flutter/widgets.dart';

/// Stub for non-web platforms — never actually used on web
Widget buildIframeWebView(String url) {
  return const Center(child: Text('Web view not supported on this platform'));
}

/// Stub for non-web platforms
Widget buildHtmlAudioPlayer(String url, String title) {
  return const Center(
    child: Text('Audio player not supported on this platform'),
  );
}
