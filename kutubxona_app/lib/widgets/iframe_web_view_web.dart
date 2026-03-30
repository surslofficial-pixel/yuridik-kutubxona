import 'dart:ui_web' as ui_web;
import 'package:flutter/widgets.dart';
import 'package:web/web.dart' as web;
import 'dart:js_interop';

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

/// Creates a native HTML5 audio player for Flutter Web to play Google Drive MP3s
Widget buildHtmlAudioPlayer(String url, String title) {
  final viewId = 'audio-${url.hashCode}';

  ui_web.platformViewRegistry.registerViewFactory(viewId, (int id) {
    final container = web.HTMLDivElement()
      ..style.width = '100%'
      ..style.height = '100%'
      ..style.backgroundColor = '#0f172a'
      ..style.display = 'flex'
      ..style.justifyContent = 'center'
      ..style.alignItems = 'center'
      ..style.boxSizing = 'border-box'
      ..style.fontFamily = 'system-ui, sans-serif'
      ..innerHTML =
          '''
        <div style="background: #1e293b; padding: 30px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); text-align: center; width: 100%; max-width: 400px; margin: 0 auto;">
          <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
          <div style="width: 150px; height: 150px; border-radius: 50%; background: conic-gradient(from 0deg, #3b82f6, #1e40af, #3b82f6); margin: 0 auto; animation: spin 10s linear infinite; border: 8px solid #0f172a; box-shadow: 0 4px 15px rgba(0,0,0,0.3); position: relative;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 30px; height: 30px; background: #0f172a; border-radius: 50%;"></div>
          </div>
          <div style="font-size: 1.2rem; font-weight: 600; margin-top: 20px; color: #f8fafc;">${title.replaceAll("'", "&apos;").replaceAll('"', "&quot;")}</div>
          <audio controls autoplay src="${url.replaceAll('"', "&quot;")}" style="width: 100%; margin-top: 20px; outline: none; border-radius: 10px;"></audio>
        </div>
      '''
              .toJS;
    return container;
  });

  return HtmlElementView(viewType: viewId);
}
