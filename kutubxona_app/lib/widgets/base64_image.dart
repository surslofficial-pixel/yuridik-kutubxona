import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

/// A simple LRU cache with a max capacity.
class _LruCache {
  final int maxSize;
  final Map<String, Uint8List> _map = {};

  _LruCache(this.maxSize);

  Uint8List? get(String key) {
    final value = _map.remove(key);
    if (value != null) {
      _map[key] = value; // move to end (most recently used)
    }
    return value;
  }

  void put(String key, Uint8List value) {
    _map.remove(key);
    if (_map.length >= maxSize) {
      _map.remove(_map.keys.first); // evict least recently used
    }
    _map[key] = value;
  }

  bool containsKey(String key) => _map.containsKey(key);
}

class Base64Image extends StatefulWidget {
  final String base64String;
  final BoxFit fit;
  final Widget? placeholder;
  final Widget? errorWidget;

  const Base64Image({
    super.key,
    required this.base64String,
    this.fit = BoxFit.cover,
    this.placeholder,
    this.errorWidget,
  });

  @override
  State<Base64Image> createState() => _Base64ImageState();
}

class _Base64ImageState extends State<Base64Image> {
  static final _LruCache _cache = _LruCache(50);
  Uint8List? _bytes;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didUpdateWidget(Base64Image oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.base64String != widget.base64String) {
      _load();
    }
  }

  Future<void> _load() async {
    // Fast path: serve from LRU cache synchronously
    final cached = _cache.get(widget.base64String);
    if (cached != null) {
      setState(() {
        _bytes = cached;
        _hasError = false;
      });
      return;
    }

    try {
      // Decode inside compute to 100% avoid blocking main isolate
      final bytes = await compute(_decodeBase64, widget.base64String);
      _cache.put(widget.base64String, bytes);
      if (mounted) {
        setState(() {
          _bytes = bytes;
          _hasError = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _hasError = true);
    }
  }

  static Uint8List _decodeBase64(String uriString) {
    return UriData.parse(uriString).contentAsBytes();
  }

  @override
  Widget build(BuildContext context) {
    if (_hasError) return widget.errorWidget ?? const SizedBox();
    if (_bytes == null) return widget.placeholder ?? const SizedBox();

    return Image.memory(
      _bytes!,
      fit: widget.fit,
      gaplessPlayback: true,
      errorBuilder: (_, _, _) => widget.errorWidget ?? const SizedBox(),
    );
  }
}
