import 'dart:io';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/foundation.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();

  factory NotificationService() => _instance;

  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  NotificationService._internal();

  Future<void> init() async {
    if (kIsWeb) return;

    // Request permissions (Android 13+ and iOS)
    NotificationSettings settings = await FirebaseMessaging.instance
        .requestPermission();
    if (settings.authorizationStatus != AuthorizationStatus.authorized) {
      return; // Permission denied
    }

    // Subscribe to topics
    await FirebaseMessaging.instance.subscribeToTopic('all_users');
    await FirebaseMessaging.instance.subscribeToTopic('updates');

    // Initialize local notifications for foreground display
    if (Platform.isAndroid || Platform.isIOS) {
      const AndroidInitializationSettings initializationSettingsAndroid =
          AndroidInitializationSettings('@mipmap/ic_launcher');

      const InitializationSettings initializationSettings =
          InitializationSettings(android: initializationSettingsAndroid);

      await _localNotifications.initialize(settings: initializationSettings);

      // Create Android channel
      const AndroidNotificationChannel channel = AndroidNotificationChannel(
        'high_importance_channel', // id
        'Muhim xabarlar', // title
        description:
            'Ilova yangilanishlari va muhim e\'lonlar uchun kanal', // description
        importance: Importance.max,
      );

      await _localNotifications
          .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin
          >()
          ?.createNotificationChannel(channel);

      // Listen to foreground messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        RemoteNotification? notification = message.notification;
        AndroidNotification? android = message.notification?.android;

        if (notification != null && android != null) {
          _localNotifications.show(
            id: notification.hashCode,
            title: notification.title,
            body: notification.body,
            notificationDetails: NotificationDetails(
              android: AndroidNotificationDetails(
                channel.id,
                channel.name,
                channelDescription: channel.description,
                icon: '@mipmap/ic_launcher',
                priority: Priority.high,
                importance: Importance.max,
              ),
            ),
          );
        }
      });
    }
  }
}
