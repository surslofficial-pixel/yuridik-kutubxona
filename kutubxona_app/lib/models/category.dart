class Category {
  final String name;
  final String iconName;
  final String color;
  final String slug;
  final String group; // maxsus, umumtalim, badiiy, ai, audio

  Category({
    required this.name,
    required this.iconName,
    required this.color,
    required this.slug,
    required this.group,
  });

  factory Category.fromMap(Map<String, dynamic> data) {
    return Category(
      name: data['name'] ?? '',
      iconName: data['iconName'] ?? 'BookOpen',
      color: data['color'] ?? 'bg-blue-100 text-blue-600',
      slug: data['slug'] ?? '',
      group: data['group'] ?? 'maxsus',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'iconName': iconName,
      'color': color,
      'slug': slug,
      'group': group,
    };
  }
}
