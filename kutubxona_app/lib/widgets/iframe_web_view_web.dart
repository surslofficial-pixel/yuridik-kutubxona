import 'dart:ui_web' as ui_web;
import 'package:flutter/widgets.dart';
import 'package:web/web.dart' as web;

/// Creates a native HTML iframe for Flutter Web to display Google Drive PDFs
Widget buildIframeWebView(String url) {
  final viewId = 'iframe-${url.hashCode}';

  ui_web.platformViewRegistry.registerViewFactory(viewId, (int id) {
    final iframe = web.HTMLIFrameElement()
      ..src = url
      ..style.border = 'none'
      ..style.width = '100%'
      ..style.height = '100%'
      ..allow = 'autoplay'
      ..setAttribute(
        'sandbox',
        'allow-scripts allow-same-origin allow-popups allow-forms',
      );
    return iframe;
  });

  return HtmlElementView(viewType: viewId);
}
