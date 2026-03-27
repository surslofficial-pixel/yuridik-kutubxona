import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_theme.dart';

class ReaderFormDialog extends StatefulWidget {
  final String bookId;
  final bool isAudio;
  final void Function(String firstName, String lastName, String groupName)
  onConfirm;

  const ReaderFormDialog({
    super.key,
    required this.bookId,
    required this.isAudio,
    required this.onConfirm,
  });

  @override
  State<ReaderFormDialog> createState() => _ReaderFormDialogState();
}

class _ReaderFormDialogState extends State<ReaderFormDialog> {
  bool _showGuestForm = false;

  // Student form
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  String _bosqich = '';
  String _guruh = '';

  // Guest form
  final _guestFirstNameCtrl = TextEditingController();
  final _guestLastNameCtrl = TextEditingController();
  String _guestType = 'hodim';
  final _guestOriginCtrl = TextEditingController();

  final _nameFormatters = [FilteringTextInputFormatter.deny(RegExp(r'[0-9]'))];

  void _confirmStudent() {
    if (_firstNameCtrl.text.isEmpty ||
        _lastNameCtrl.text.isEmpty ||
        _bosqich.isEmpty ||
        _guruh.isEmpty) {
      return;
    }

    String formatGuruh = _guruh.replaceAll(RegExp(r'\D'), '');
    if (formatGuruh.length > 1) {
      formatGuruh =
          '${formatGuruh[0]}-${formatGuruh.substring(1, formatGuruh.length.clamp(0, 4))}';
    }
    final groupName = '$_bosqich-bosqich, $formatGuruh guruh';
    widget.onConfirm(_firstNameCtrl.text, _lastNameCtrl.text, groupName);
  }

  void _confirmGuest() {
    if (_guestFirstNameCtrl.text.isEmpty ||
        _guestLastNameCtrl.text.isEmpty ||
        _guestOriginCtrl.text.isEmpty) {
      return;
    }

    final groupName = _guestType == 'hodim'
        ? 'Hodim — ${_guestOriginCtrl.text}'
        : 'Mehmon — ${_guestOriginCtrl.text}';
    widget.onConfirm(
      _guestFirstNameCtrl.text,
      _guestLastNameCtrl.text,
      groupName,
    );
  }

  @override
  void dispose() {
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _guestFirstNameCtrl.dispose();
    _guestLastNameCtrl.dispose();
    _guestOriginCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      insetPadding: const EdgeInsets.all(20),
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 300),
        child: _showGuestForm ? _buildGuestForm() : _buildStudentForm(),
      ),
    );
  }

  Widget _buildStudentForm() {
    return SingleChildScrollView(
      key: const ValueKey('student'),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  "Ma'lumotlaringizni kiriting",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textPrimary,
                  ),
                ),
                TextButton.icon(
                  onPressed: () => setState(() => _showGuestForm = true),
                  icon: const Icon(Icons.arrow_forward, size: 16),
                  label: const Text('Mehmon', style: TextStyle(fontSize: 12)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              widget.isAudio
                  ? "Audioni eshitishni boshlashdan oldin, iltimos ma'lumotlaringizni kiriting."
                  : "Kitobni o'qishni boshlashdan oldin, iltimos ma'lumotlaringizni kiriting.",
              style: const TextStyle(
                fontSize: 13,
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 16),
            // Info box
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFBFDBFE)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline, size: 18, color: Color(0xFF3B82F6)),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      "Texnikum o'quvchisi bo'lmasangiz, Mehmon tugmasini bosing.",
                      style: TextStyle(fontSize: 12, color: Color(0xFF1D4ED8)),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            _buildTextField(
              _firstNameCtrl,
              'Ism',
              Icons.person_outline,
              'Masalan: Sardor',
              inputFormatters: _nameFormatters,
            ),
            const SizedBox(height: 12),
            _buildTextField(
              _lastNameCtrl,
              'Familiya',
              Icons.account_circle_outlined,
              'Masalan: Ahmedov',
              inputFormatters: _nameFormatters,
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _label('Bosqich'),
                      const SizedBox(height: 4),
                      DropdownButtonFormField<String>(
                        decoration: InputDecoration(
                          prefixIcon: const Icon(
                            Icons.school_outlined,
                            size: 18,
                            color: AppTheme.textTertiary,
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 10,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        hint: const Text(
                          'Tanlang',
                          style: TextStyle(fontSize: 13),
                        ),
                        initialValue: _bosqich.isEmpty ? null : _bosqich,
                        items: ['1', '2']
                            .map(
                              (b) => DropdownMenuItem(
                                value: b,
                                child: Text('$b-bosqich'),
                              ),
                            )
                            .toList(),
                        onChanged: (v) => setState(() => _bosqich = v ?? ''),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _label('Guruh'),
                      const SizedBox(height: 4),
                      TextField(
                        keyboardType: TextInputType.number,
                        maxLength: 5,
                        decoration: InputDecoration(
                          counterText: '',
                          prefixIcon: const Icon(
                            Icons.menu_book_outlined,
                            size: 18,
                            color: AppTheme.textTertiary,
                          ),
                          hintText: '0-25',
                          hintStyle: const TextStyle(fontSize: 13),
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 10,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onChanged: (v) => setState(() => _guruh = v),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                OutlinedButton(
                  onPressed: () => Navigator.pop(context),
                  style: OutlinedButton.styleFrom(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                  child: const Text('Bekor qilish'),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed:
                      (_firstNameCtrl.text.isNotEmpty &&
                          _lastNameCtrl.text.isNotEmpty &&
                          _bosqich.isNotEmpty &&
                          _guruh.isNotEmpty)
                      ? _confirmStudent
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryDark,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                  child: Text(
                    widget.isAudio
                        ? "Eshitishni boshlash"
                        : "O'qishni boshlash",
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGuestForm() {
    return SingleChildScrollView(
      key: const ValueKey('guest'),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                IconButton(
                  onPressed: () => setState(() => _showGuestForm = false),
                  icon: const Icon(Icons.arrow_back, size: 20),
                ),
                const Text(
                  'Mehmon / Hodim',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            const Text(
              "Ism, familiya va kimligingizni kiriting.",
              style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 16),
            _buildTextField(
              _guestFirstNameCtrl,
              'Ism',
              Icons.person_outline,
              'Masalan: Sardor',
              inputFormatters: _nameFormatters,
            ),
            const SizedBox(height: 12),
            _buildTextField(
              _guestLastNameCtrl,
              'Familiya',
              Icons.account_circle_outlined,
              'Masalan: Ahmedov',
              inputFormatters: _nameFormatters,
            ),
            const SizedBox(height: 12),
            _label('Kim siz?'),
            const SizedBox(height: 6),
            Row(
              children: [
                Expanded(
                  child: _choiceButton(
                    'Hodim',
                    Icons.business_center_outlined,
                    _guestType == 'hodim',
                    () => setState(() {
                      _guestType = 'hodim';
                      _guestOriginCtrl.clear();
                    }),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _choiceButton(
                    'Tashqi mehmon',
                    Icons.location_on_outlined,
                    _guestType == 'tashqi',
                    () => setState(() {
                      _guestType = 'tashqi';
                      _guestOriginCtrl.clear();
                    }),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _buildTextField(
              _guestOriginCtrl,
              _guestType == 'hodim' ? 'Lavozimingiz' : 'Qayerdan kiryapsiz?',
              _guestType == 'hodim'
                  ? Icons.business_center_outlined
                  : Icons.language_outlined,
              _guestType == 'hodim'
                  ? 'Masalan: Kutubxonachi'
                  : "Masalan: O'qish joyidan",
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                OutlinedButton(
                  onPressed: () => setState(() => _showGuestForm = false),
                  style: OutlinedButton.styleFrom(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                  child: const Text('Orqaga'),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed:
                      (_guestFirstNameCtrl.text.isNotEmpty &&
                          _guestLastNameCtrl.text.isNotEmpty &&
                          _guestOriginCtrl.text.isNotEmpty)
                      ? _confirmGuest
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryDark,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                  child: Text(
                    widget.isAudio
                        ? "Eshitishni boshlash"
                        : "O'qishni boshlash",
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(
    TextEditingController ctrl,
    String label,
    IconData icon,
    String hint, {
    List<TextInputFormatter>? inputFormatters,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _label(label),
        const SizedBox(height: 4),
        TextField(
          controller: ctrl,
          inputFormatters: inputFormatters,
          keyboardType: TextInputType.name,
          onChanged: (_) => setState(() {}),
          decoration: InputDecoration(
            prefixIcon: Icon(icon, size: 18, color: AppTheme.textTertiary),
            hintText: hint,
            hintStyle: const TextStyle(fontSize: 13),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 10,
            ),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
      ],
    );
  }

  Widget _label(String text) {
    return RichText(
      text: TextSpan(
        text: text,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: AppTheme.textPrimary,
        ),
        children: const [
          TextSpan(
            text: ' *',
            style: TextStyle(color: Colors.red),
          ),
        ],
      ),
    );
  }

  Widget _choiceButton(
    String label,
    IconData icon,
    bool isSelected,
    VoidCallback onTap,
  ) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primaryDark : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppTheme.primaryDark : AppTheme.borderLight,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 16,
              color: isSelected ? Colors.white : AppTheme.textSecondary,
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: isSelected ? Colors.white : AppTheme.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
