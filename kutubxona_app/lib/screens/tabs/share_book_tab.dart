import 'package:flutter/material.dart';
import '../../services/firebase_service.dart';
import '../../theme/app_theme.dart';

class ShareBookTab extends StatefulWidget {
  const ShareBookTab({super.key});

  @override
  State<ShareBookTab> createState() => _ShareBookTabState();
}

class _ShareBookTabState extends State<ShareBookTab> {
  final _formKey = GlobalKey<FormState>();
  final _firebase = FirebaseService();
  final _titleCtrl = TextEditingController();
  final _authorCtrl = TextEditingController();
  final _linkCtrl = TextEditingController();
  final _senderCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  String _selectedCategory = 'Huquqshunoslik';
  bool _isSending = false;
  bool _sent = false;

  final _categories = [
    'Huquqshunoslik',
    'Iqtisodiyot',
    'Tarix',
    'Adabiyot',
    'Informatika',
    'Pedagogika',
    'Boshqa',
  ];

  @override
  void dispose() {
    _titleCtrl.dispose();
    _authorCtrl.dispose();
    _linkCtrl.dispose();
    _senderCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSending = true);

    try {
      await _firebase.submitAuthorBook({
        'title': _titleCtrl.text.trim(),
        'author': _authorCtrl.text.trim(),
        'driveUrl': _linkCtrl.text.trim(),
        'senderName': _senderCtrl.text.trim(),
        'description': _descCtrl.text.trim(),
        'category': _selectedCategory,
        'categorySlug': _selectedCategory.toLowerCase().replaceAll(' ', '-'),
      });
      if (mounted) {
        setState(() {
          _isSending = false;
          _sent = true;
        });
        _titleCtrl.clear();
        _authorCtrl.clear();
        _linkCtrl.clear();
        _senderCtrl.clear();
        _descCtrl.clear();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSending = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Xatolik: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surfaceLight,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // Header
            SliverToBoxAdapter(
              child: Container(
                padding: const EdgeInsets.fromLTRB(24, 24, 24, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: const Color(
                              0xFF7C3AED,
                            ).withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Icon(
                            Icons.auto_stories_rounded,
                            color: Color(0xFF7C3AED),
                            size: 28,
                          ),
                        ),
                        const SizedBox(width: 14),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Mualliflar',
                                style: TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.w800,
                                  color: AppTheme.textPrimary,
                                ),
                              ),
                              SizedBox(height: 2),
                              Text(
                                "O'z kitobingizni kutubxonaga taklif qiling",
                                style: TextStyle(
                                  fontSize: 13,
                                  color: AppTheme.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Info Card
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFFEDE9FE), Color(0xFFF5F3FF)],
                        ),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFDDD6FE)),
                      ),
                      child: const Row(
                        children: [
                          Icon(
                            Icons.info_outline_rounded,
                            color: Color(0xFF7C3AED),
                            size: 22,
                          ),
                          SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              "Sizning kitobingiz ma'muriyat tomonidan ko'rib chiqilib, tasdiqlangandan so'ng kutubxonaga qo'shiladi.",
                              style: TextStyle(
                                fontSize: 12,
                                color: Color(0xFF6D28D9),
                                height: 1.4,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Form or Success
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: _sent ? _buildSuccess() : _buildForm(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSuccess() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF10B981).withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.check_circle_rounded,
              color: Color(0xFF10B981),
              size: 48,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Rahmat!',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w800,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            "Kitobingiz muvaffaqiyatli yuborildi. Ma'muriyat ko'rib chiqgandan so'ng kutubxonaga qo'shiladi.",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: AppTheme.textSecondary,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () => setState(() => _sent = false),
              icon: const Icon(Icons.add, size: 18),
              label: const Text('Yana kitob yuborish'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF7C3AED),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildForm() {
    return Form(
      key: _formKey,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 20,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildTextField(
              controller: _titleCtrl,
              label: 'Kitob nomi',
              hint: "Masalan: Davlat va huquq nazariyasi",
              icon: Icons.menu_book_rounded,
              validator: (v) => v == null || v.trim().isEmpty
                  ? 'Kitob nomini kiriting'
                  : null,
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _authorCtrl,
              label: 'Muallif',
              hint: "Masalan: I. Karimov",
              icon: Icons.person_rounded,
              validator: (v) =>
                  v == null || v.trim().isEmpty ? 'Muallifni kiriting' : null,
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _linkCtrl,
              label: 'Kitob havolasi (Google Drive, link)',
              hint: 'https://drive.google.com/...',
              icon: Icons.link_rounded,
              validator: (v) =>
                  v == null || v.trim().isEmpty ? 'Havolani kiriting' : null,
            ),
            const SizedBox(height: 16),

            // Category dropdown
            const Text(
              'Kategoriya',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppTheme.borderLight),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedCategory,
                  isExpanded: true,
                  items: _categories
                      .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                      .toList(),
                  onChanged: (v) => setState(() => _selectedCategory = v!),
                ),
              ),
            ),

            const SizedBox(height: 16),
            _buildTextField(
              controller: _descCtrl,
              label: 'Qisqacha tavsif (ixtiyoriy)',
              hint: 'Bu kitob haqida...',
              icon: Icons.description_rounded,
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _senderCtrl,
              label: "Sizning ismingiz",
              hint: "Masalan: Aziz Toshmatov",
              icon: Icons.badge_rounded,
              validator: (v) =>
                  v == null || v.trim().isEmpty ? 'Ismingizni kiriting' : null,
            ),

            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _isSending ? null : _submit,
                icon: _isSending
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.send_rounded, size: 18),
                label: Text(_isSending ? 'Yuborilmoqda...' : 'Yuborish'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF7C3AED),
                  disabledBackgroundColor: const Color(
                    0xFF7C3AED,
                  ).withValues(alpha: 0.5),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  textStyle: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    String? Function(String?)? validator,
    int maxLines = 1,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppTheme.textSecondary,
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          validator: validator,
          maxLines: maxLines,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: Colors.grey[400], fontSize: 14),
            prefixIcon: Icon(icon, size: 20, color: const Color(0xFF7C3AED)),
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: AppTheme.borderLight),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: AppTheme.borderLight),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(
                color: Color(0xFF7C3AED),
                width: 1.5,
              ),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: Colors.red),
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 14,
            ),
          ),
        ),
      ],
    );
  }
}
