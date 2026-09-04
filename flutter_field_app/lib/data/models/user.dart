class User {
  final String id;
  final String role;
  final String? email;
  final String? displayName;
  final String? jurisdiction;
  final bool active;
  
  User({
    required this.id, 
    required this.role, 
    this.email, 
    this.displayName, 
    this.jurisdiction,
    this.active = true,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      role: json['role'] ?? '',
      email: json['email'],
      displayName: json['displayName'],
      jurisdiction: json['jurisdiction'],
      active: json['active'] ?? true,
    );
  }
}