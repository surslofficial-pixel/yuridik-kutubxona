import 'package:flutter/material.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

class ConnectivityBanner extends StatefulWidget {
  final Widget child;
  const ConnectivityBanner({super.key, required this.child});

  @override
  State<ConnectivityBanner> createState() => _ConnectivityBannerState();
}

class _ConnectivityBannerState extends State<ConnectivityBanner> {
  bool _hasInternet = true;
  late final Stream<List<ConnectivityResult>> _connectivityStream;

  @override
  void initState() {
    super.initState();
    _connectivityStream = Connectivity().onConnectivityChanged;
    _checkInitial();
  }

  Future<void> _checkInitial() async {
    final result = await Connectivity().checkConnectivity();
    _updateStatus(result);
  }

  void _updateStatus(List<ConnectivityResult> result) {
    if (result.contains(ConnectivityResult.none) || result.isEmpty) {
      if (_hasInternet) setState(() => _hasInternet = false);
    } else {
      if (!_hasInternet) setState(() => _hasInternet = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        top: false,
        bottom: false,
        child: Stack(
          children: [
            widget.child,
            StreamBuilder<List<ConnectivityResult>>(
              stream: _connectivityStream,
              builder: (context, snapshot) {
                if (snapshot.hasData) {
                  WidgetsBinding.instance.addPostFrameCallback((_) {
                    _updateStatus(snapshot.data!);
                  });
                }

                return AnimatedPositioned(
                  duration: const Duration(milliseconds: 300),
                  top: _hasInternet ? -50 : 0,
                  left: 0,
                  right: 0,
                  height: 40,
                  child: SafeArea(
                    bottom: false,
                    child: Container(
                      color: Colors.red.shade600,
                      alignment: Alignment.center,
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.wifi_off_rounded,
                            color: Colors.white,
                            size: 16,
                          ),
                          SizedBox(width: 8),
                          Text(
                            "Internet ulanishi yo'q",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
