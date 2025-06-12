import 'dart:io' as io;
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import '../theme/app_theme.dart';

class CreateClubScreen extends StatefulWidget {
  const CreateClubScreen({super.key});

  @override
  State<CreateClubScreen> createState() => _CreateClubScreenState();
}

class _CreateClubScreenState extends State<CreateClubScreen> {
  final _clubName = TextEditingController();
  final _description = TextEditingController();
  final _schedule = TextEditingController();
  final _rules = TextEditingController();
  final _adminEmail = TextEditingController();
  String _category = 'Tech';
  String _permissionLevel = 'full';

  dynamic _logoFile;
  dynamic _bannerFile;
  Uint8List? _logoBytes;
  Uint8List? _bannerBytes;
  bool _loading = false;
  String? _status;

  final List<String> _categories = ['Tech', 'Sports', 'Arts', 'Cultural', 'Literary'];

  Future<void> _pickImage(ImageSource source, bool isLogo) async {
    final picked = await ImagePicker().pickImage(source: source);
    if (picked != null) {
      if (kIsWeb) {
        // Handle web platform
        final bytes = await picked.readAsBytes();
        setState(() {
          if (isLogo) {
            _logoBytes = bytes;
            _logoFile = picked;
          } else {
            _bannerBytes = bytes;
            _bannerFile = picked;
          }
        });
      } else {
        // Handle mobile platform
        setState(() {
          if (isLogo) {
            _logoFile = io.File(picked.path);
          } else {
            _bannerFile = io.File(picked.path);
          }
        });
      }
    }
  }

  Future<String> _uploadFile(dynamic file, String path, {Uint8List? bytes}) async {
    final ref = FirebaseStorage.instance.ref().child(path);
    
    if (kIsWeb) {
      // Handle web platform using bytes
      if (bytes != null) {
        await ref.putData(bytes);
      } else if (file is XFile) {
        final imageBytes = await file.readAsBytes();
        await ref.putData(imageBytes);
      }
    } else {
      // Handle mobile platform using File
      await ref.putFile(file as io.File);
    }
    
    return await ref.getDownloadURL();
  }

  Future<void> _createClub() async {
    if (_clubName.text.isEmpty || _adminEmail.text.isEmpty || _logoFile == null) {
      setState(() => _status = 'Club name, admin email, and logo are required.');
      return;
    }

    setState(() {
      _loading = true;
      _status = null;
    });

    try {
      final collegeAdmin = FirebaseAuth.instance.currentUser!;
      final collegeSnapshot = await FirebaseFirestore.instance.collection('users').doc(collegeAdmin.uid).get();
      final collegeId = collegeSnapshot.data()?['collegeId'];

      // Create club admin account
      final tempPass = 'Temp@1234';
      final adminCred = await FirebaseAuth.instance.createUserWithEmailAndPassword(
        email: _adminEmail.text.trim(),
        password: tempPass,
      );

      final adminUid = adminCred.user!.uid;
      await FirebaseAuth.instance.sendPasswordResetEmail(email: _adminEmail.text.trim());

      // Upload images
      final logoUrl = await _uploadFile(_logoFile!, 'clubs/logos/${_clubName.text.trim()}', bytes: _logoBytes);
      final bannerUrl = _bannerFile != null
          ? await _uploadFile(_bannerFile!, 'clubs/banners/${_clubName.text.trim()}', bytes: _bannerBytes)
          : '';

      // Create club
      final clubDoc = await FirebaseFirestore.instance.collection('clubs').add({
        'name': _clubName.text.trim(),
        'description': _description.text.trim(),
        'category': _category,
        'logoUrl': logoUrl,
        'bannerUrl': bannerUrl,
        'meetingSchedule': _schedule.text.trim(),
        'rules': _rules.text.trim(),
        'adminUid': adminUid,
        'collegeId': collegeId,
        'createdAt': FieldValue.serverTimestamp(),
      });

      // Update club admin user
      await FirebaseFirestore.instance.collection('users').doc(adminUid).set({
        'email': _adminEmail.text.trim(),
        'role': 'club_admin',
        'collegeId': collegeId,
        'clubId': clubDoc.id,
        'permissionLevel': _permissionLevel,
      });

      setState(() {
        _status = '✅ Club created and admin invited.';
        _clubName.clear();
        _description.clear();
        _schedule.clear();
        _rules.clear();
        _adminEmail.clear();
        _logoFile = null;
        _bannerFile = null;
      });
    } catch (e) {
      setState(() => _status = 'Error: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  Widget _buildImagePicker(String label, bool isLogo) {
    final file = isLogo ? _logoFile : _bannerFile;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label),
        const SizedBox(height: 6),
        Row(
          children: [
            ElevatedButton(
              onPressed: () => _pickImage(ImageSource.gallery, isLogo),
              child: Text(file == null ? 'Select Image' : 'Change Image'),
            ),
            const SizedBox(width: 10),
            if (file != null) Text(kIsWeb 
              ? (file is XFile ? file.name : 'Selected image') 
              : (file as io.File).path.split('/').last),
          ],
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create New Club')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _clubName,
              decoration: const InputDecoration(labelText: 'Club Name', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _category,
              onChanged: (val) => setState(() => _category = val!),
              items: _categories.map((cat) => DropdownMenuItem(value: cat, child: Text(cat))).toList(),
              decoration: const InputDecoration(labelText: 'Category', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _description,
              maxLines: 3,
              decoration: const InputDecoration(labelText: 'Description', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            _buildImagePicker('Club Logo *', true),
            const SizedBox(height: 12),
            _buildImagePicker('Club Banner (optional)', false),
            const SizedBox(height: 12),
            TextField(
              controller: _schedule,
              decoration: const InputDecoration(labelText: 'Meeting Schedule', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _rules,
              maxLines: 3,
              decoration: const InputDecoration(labelText: 'Club Rules', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 20),
            const Divider(),
            const SizedBox(height: 12),
            const Text('Assign Club Admin', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextField(
              controller: _adminEmail,
              decoration: const InputDecoration(labelText: 'Admin Email', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _permissionLevel,
              onChanged: (val) => setState(() => _permissionLevel = val!),
              items: const [
                DropdownMenuItem(value: 'full', child: Text('Full Access')),
                DropdownMenuItem(value: 'limited', child: Text('Limited Access')),
              ],
              decoration: const InputDecoration(labelText: 'Permissions', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              icon: const Icon(Icons.publish),
              onPressed: _loading ? null : _createClub,
              label: _loading
                  ? const CircularProgressIndicator()
                  : const Text('Publish Club'),
            ),
            if (_status != null)
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: Text(
                  _status!,
                  style: TextStyle(
                    color: _status!.startsWith('Error') ? AppTheme.errorColor : AppTheme.successColor,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
