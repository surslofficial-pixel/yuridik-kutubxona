class AiTopic {
  final String id;
  final String title;
  final String description;
  final String iconName;
  final String color;

  AiTopic({
    required this.id,
    required this.title,
    required this.description,
    required this.iconName,
    required this.color,
  });

  factory AiTopic.fromMap(String docId, Map<String, dynamic> data) {
    return AiTopic(
      id: docId,
      title: data['title'] ?? '',
      description: data['description'] ?? '',
      iconName: data['iconName'] ?? 'BookOpen',
      color: data['color'] ?? 'from-indigo-500 to-blue-500',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'iconName': iconName,
      'color': color,
    };
  }
}
