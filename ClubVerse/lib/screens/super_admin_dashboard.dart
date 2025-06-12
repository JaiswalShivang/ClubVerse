import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../theme/app_theme.dart';

class SuperAdminDashboard extends StatefulWidget {
  const SuperAdminDashboard({super.key});

  @override
  State<SuperAdminDashboard> createState() => _SuperAdminDashboardState();
}

class _SuperAdminDashboardState extends State<SuperAdminDashboard> {
  // Step 1: Hard-coded super admin login
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _authenticated = false;
  String? _loginError;

  // Step 2: College admin creation
  final _adminEmail = TextEditingController();
  final _collegeId = TextEditingController();
  final _collegeName = TextEditingController();
  bool _isCreating = false;
  String? _status;
  
  // Navigation state
  int _selectedIndex = 0;
  final List<String> _navItems = [
    'Dashboard',
    'Create College',
    'College List',
    'College Management',
    'Settings',
    'Logout'
  ];
  final List<IconData> _navIcons = [
    Icons.dashboard_outlined,
    Icons.add_business_outlined,
    Icons.list_alt_outlined,
    Icons.business_outlined,
    Icons.settings_outlined,
    Icons.logout_outlined
  ];

  final String superAdminEmail = 'admin-uniclub@gmail.com';
  final String superAdminPassword = 'Admin@123';

  void _verifySuperAdmin() {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email == superAdminEmail && password == superAdminPassword) {
      setState(() {
        _authenticated = true;
        _loginError = null;
      });
    } else {
      setState(() {
        _loginError = 'Invalid super admin credentials';
      });
    }
  }

  void _createCollegeAdmin() async {
    final email = _adminEmail.text.trim();
    final collegeId = _collegeId.text.trim();
    final collegeName = _collegeName.text.trim();

    if (email.isEmpty || collegeId.isEmpty || collegeName.isEmpty) {
      setState(() => _status = 'All fields are required');
      return;
    }

    setState(() {
      _isCreating = true;
      _status = 'Creating college admin...';
    });

    try {
      // Check if college already exists
      final collegeDoc = await FirebaseFirestore.instance
          .collection('colleges')
          .doc(collegeId)
          .get();

      if (collegeDoc.exists) {
        setState(() {
          _isCreating = false;
          _status = 'Error: College ID already exists';
        });
        return;
      }

      // Create college in Firestore
      await FirebaseFirestore.instance.collection('colleges').doc(collegeId).set({
        'name': collegeName,
        'domain': email.split('@').last,
        'adminEmail': email,
        'createdAt': FieldValue.serverTimestamp(),
      });

      // TODO: Send invitation email to admin

      setState(() {
        _isCreating = false;
        _status = 'College admin created successfully!';
        _adminEmail.clear();
        _collegeId.clear();
        _collegeName.clear();
      });
    } catch (e) {
      setState(() => _status = 'Error: ${e.toString()}');
    }
  }

  Widget _buildLoginUI() {
    return Center(
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 40),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Center(
                      child: Text(
                        'Super Admin Login',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF7C4DFF),
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),
                    TextField(
                      controller: _emailController,
                      decoration: const InputDecoration(
                        labelText: 'Email',
                        prefixIcon: Icon(Icons.email),
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _passwordController,
                      decoration: const InputDecoration(
                        labelText: 'Password',
                        prefixIcon: Icon(Icons.lock),
                        border: OutlineInputBorder(),
                      ),
                      obscureText: true,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: _verifySuperAdmin,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF7C4DFF),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text(
                        'Login',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    if (_loginError != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 16),
                        child: Text(
                          _loginError!,
                          style: const TextStyle(color: Colors.red),
                          textAlign: TextAlign.center,
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAdminCreatorUI() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Create College Admin',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    TextField(
                      controller: _adminEmail,
                      decoration: const InputDecoration(
                        labelText: 'Admin Email',
                        hintText: 'Enter college admin email',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _collegeId,
                      decoration: const InputDecoration(
                        labelText: 'College ID',
                        hintText: 'Enter unique college identifier',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _collegeName,
                      decoration: const InputDecoration(
                        labelText: 'College Name',
                        hintText: 'Enter college name',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: _isCreating ? null : _createCollegeAdmin,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF7C4DFF),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: _isCreating
                          ? const CircularProgressIndicator(color: AppTheme.textLightColor)
                          : const Text('Create & Invite'),
                    ),
                  ],
                ),
              ),
            ),
            if (_status != null)
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: Center(
                  child: Text(
                    _status!,
                    style: TextStyle(
                      color: _status!.startsWith('Error') ? AppTheme.errorColor : AppTheme.successColor,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  // Method to build the navigation sidebar
  Widget _buildSidebar() {
    return Container(
      width: 250,
      color: AppTheme.primaryColor,
      child: Column(
        children: [
          const SizedBox(height: 20),
          // Logo and app name
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: const [
                Icon(
                  Icons.school,
                  color: Colors.white,
                  size: 32,
                ),
                SizedBox(width: 12),
                Text(
                  'UNICLUB',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Divider(color: Colors.white24, height: 1),
          const SizedBox(height: 10),
          // Navigation items
          Expanded(
            child: ListView.builder(
              itemCount: _navItems.length,
              itemBuilder: (context, index) {
                return ListTile(
                  leading: Icon(
                    _navIcons[index],
                    color: _selectedIndex == index
                        ? Colors.white
                        : Colors.white70,
                  ),
                  title: Text(
                    _navItems[index],
                    style: TextStyle(
                      color: _selectedIndex == index
                          ? Colors.white
                          : Colors.white70,
                    ),
                  ),
                  selected: _selectedIndex == index,
                  selectedTileColor: AppTheme.textLightColor.withAlpha(25),
                  onTap: () {
                    setState(() {
                      _selectedIndex = index;
                    });
                    // Handle logout
                    if (index == _navItems.length - 1) {
                      setState(() {
                        _authenticated = false;
                        _selectedIndex = 0;
                      });
                    }
                  },
                );
              },
            ),
          ),
          // User info at bottom
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                const CircleAvatar(
                  backgroundColor: Colors.white,
                  child: Icon(
                    Icons.person,
                    color: Color(0xFF7C4DFF),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'Super Admin',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Logged In',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Method to build the content area based on selected navigation item
  Widget _buildContent() {
    if (!_authenticated) {
      return Center(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 40),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Card(
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                child: _buildLoginUI(),
              ),
            ),
          ),
        ),
      );
    }

    switch (_selectedIndex) {
      case 0:
        return _buildDashboardUI();
      case 1:
        return _buildCreateCollegeUI();
      case 2:
        return _buildCollegeListUI();
      case 3:
        return _buildAdminCreatorUI();
      case 4:
        return _buildSettingsUI();
      default:
        return const Center(child: Text('Page not found'));
    }
  }

  // Dashboard UI
  Widget _buildDashboardUI() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Welcome, Super Admin',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            // Stats cards
            Expanded(
              child: GridView.count(
                crossAxisCount: 3,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                children: [
                  _buildStatCard('Total Colleges', '12', Icons.school),
                  _buildStatCard('Total Students', '1,234', Icons.people),
                  _buildStatCard('Total Clubs', '56', Icons.groups),
                  _buildStatCard('Active Events', '8', Icons.event),
                  _buildStatCard('New Registrations', '24', Icons.person_add),
                  _buildStatCard('System Status', 'Healthy', Icons.check_circle),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Stat card widget
  Widget _buildStatCard(String title, String value, IconData icon) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: AppTheme.primaryColor),
            const SizedBox(height: 16),
            Text(
              value,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: const TextStyle(color: AppTheme.textSecondaryColor),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  // Create College UI
  Widget _buildCreateCollegeUI() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Create New College',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: Card(
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Center(
                  child: Text(
                    'College creation form will be here',
                    style: TextStyle(color: Colors.grey),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // College List UI
  Widget _buildCollegeListUI() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'College List',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              ElevatedButton.icon(
                onPressed: () => _showAddCollegeDialog(context),
                icon: const Icon(Icons.add),
                label: const Text('Add College'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF7C4DFF),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Expanded(
            child: StreamBuilder<QuerySnapshot>(
              stream: FirebaseFirestore.instance.collection('colleges').snapshots(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                
                if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}'));
                }
                
                final colleges = snapshot.data?.docs ?? [];
                
                if (colleges.isEmpty) {
                  return const Center(
                    child: Text('No colleges found. Add your first college!'),
                  );
                }
                
                return ListView.builder(
                  itemCount: colleges.length,
                  itemBuilder: (context, index) {
                    final college = colleges[index].data() as Map<String, dynamic>;
                    final collegeId = colleges[index].id;
                    final collegeName = college['name'] as String?;
                    final collegeDomain = college['domain'] as String?;
                    
                    return Card(
                      margin: const EdgeInsets.only(bottom: 16),
                      elevation: 2,
                      child: ListTile(
                        title: Text(collegeName ?? 'Unnamed College'),
                        subtitle: Text(collegeDomain ?? 'No domain'),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.edit, color: Colors.blue),
                              onPressed: () => _showEditCollegeDialog(context, collegeId, college),
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete, color: Colors.red),
                              onPressed: () => _showDeleteCollegeDialog(context, collegeId, collegeName),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
  
  // Dialog to add a new college
  void _showAddCollegeDialog(BuildContext context) {
    final collegeNameController = TextEditingController();
    final collegeIdController = TextEditingController();
    final collegeDomainController = TextEditingController();
    String? errorMessage;
    
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) {
          return AlertDialog(
            title: const Text('Add New College'),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: collegeNameController,
                    decoration: const InputDecoration(
                      labelText: 'College Name',
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: collegeIdController,
                    decoration: const InputDecoration(
                      labelText: 'College ID',
                      hintText: 'Unique identifier (e.g., harvard, mit)',
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: collegeDomainController,
                    decoration: const InputDecoration(
                      labelText: 'College Email Domain',
                      hintText: 'e.g., harvard.edu',
                    ),
                  ),
                  if (errorMessage != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 16),
                      child: Text(
                        errorMessage!,
                        style: const TextStyle(color: Colors.red),
                      ),
                    ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () async {
                  // Store the context before async operations
                  final currentContext = context;
                  
                  final name = collegeNameController.text.trim();
                  final id = collegeIdController.text.trim();
                  final domain = collegeDomainController.text.trim();
                  
                  if (name.isEmpty || id.isEmpty || domain.isEmpty) {
                    setState(() => errorMessage = 'All fields are required');
                    return;
                  }
                  
                  try {
                    // Check if college ID already exists
                    final collegeDoc = await FirebaseFirestore.instance
                        .collection('colleges')
                        .doc(id)
                        .get();
                        
                    if (collegeDoc.exists) {
                      setState(() => errorMessage = 'College ID already exists');
                      return;
                    }
                    
                    // Add the college to Firestore
                    await FirebaseFirestore.instance.collection('colleges').doc(id).set({
                      'name': name,
                      'domain': domain,
                      'createdAt': FieldValue.serverTimestamp(),
                    });
                    
                    // Check if widget is still mounted before using context
                    if (!mounted) return;
                    Navigator.pop(currentContext);
                    
                    if (!mounted) return;
                    ScaffoldMessenger.of(currentContext).showSnackBar(
                      SnackBar(content: Text('College "$name" added successfully')),
                    );
                  } catch (e) {
                    setState(() => errorMessage = 'Error: ${e.toString()}');
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF7C4DFF),
                ),
                child: const Text('Add College'),
              ),
            ],
          );
        },
      ),
    );
  }
  
  // Dialog to edit an existing college
  void _showEditCollegeDialog(BuildContext context, String collegeId, Map<String, dynamic> college) {
    final collegeNameController = TextEditingController(text: college['name']);
    final collegeDomainController = TextEditingController(text: college['domain']);
    String? errorMessage;
    
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) {
          return AlertDialog(
            title: const Text('Edit College'),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: collegeNameController,
                    decoration: const InputDecoration(
                      labelText: 'College Name',
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: collegeDomainController,
                    decoration: const InputDecoration(
                      labelText: 'College Email Domain',
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'College ID: $collegeId (cannot be changed)',
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                  if (errorMessage != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 16),
                      child: Text(
                        errorMessage!,
                        style: const TextStyle(color: Colors.red),
                      ),
                    ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () async {
                  // Store the context before async operations
                  final currentContext = context;
                  
                  final name = collegeNameController.text.trim();
                  final domain = collegeDomainController.text.trim();
                  
                  if (name.isEmpty || domain.isEmpty) {
                    setState(() => errorMessage = 'All fields are required');
                    return;
                  }
                  
                  try {
                    // Update the college in Firestore
                    await FirebaseFirestore.instance.collection('colleges').doc(collegeId).update({
                      'name': name,
                      'domain': domain,
                      'updatedAt': FieldValue.serverTimestamp(),
                    });
                    
                    // Check if widget is still mounted before using context
                    if (!mounted) return;
                    Navigator.pop(currentContext);
                    
                    if (!mounted) return;
                    ScaffoldMessenger.of(currentContext).showSnackBar(
                      SnackBar(content: Text('College "$name" updated successfully')),
                    );
                  } catch (e) {
                    setState(() => errorMessage = 'Error: ${e.toString()}');
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF7C4DFF),
                ),
                child: const Text('Update College'),
              ),
            ],
          );
        },
      ),
    );
  }
  
  // Dialog to confirm deletion of a college
  void _showDeleteCollegeDialog(BuildContext context, String collegeId, String? collegeName) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete College'),
        content: Text('Are you sure you want to delete "${collegeName ?? 'this college'}"? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              // Store the context and check if mounted before using it after async gap
              final currentContext = context;
              try {
                // Delete the college from Firestore
                await FirebaseFirestore.instance.collection('colleges').doc(collegeId).delete();
                
                // Check if widget is still mounted before using context
                if (!mounted) return;
                Navigator.pop(currentContext);
                
                if (!mounted) return;
                ScaffoldMessenger.of(currentContext).showSnackBar(
                  SnackBar(content: Text('College "${collegeName ?? 'Unknown'}" deleted successfully')),
                );
              } catch (e) {
                // Check if widget is still mounted before using context
                if (!mounted) return;
                Navigator.pop(currentContext);
                
                if (!mounted) return;
                ScaffoldMessenger.of(currentContext).showSnackBar(
                  SnackBar(content: Text('Error deleting college: ${e.toString()}')),
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  // Settings UI
  Widget _buildSettingsUI() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Settings',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: Card(
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Center(
                  child: Text(
                    'Settings will be available here',
                    style: TextStyle(color: Colors.grey),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Super Admin Dashboard'),
        backgroundColor: const Color(0xFF7C4DFF),
        foregroundColor: Colors.white,
        elevation: 0,
        // Only show menu button when authenticated
        leading: _authenticated
            ? Builder(
                builder: (context) => IconButton(
                  icon: const Icon(Icons.menu),
                  onPressed: () {
                    Scaffold.of(context).openDrawer();
                  },
                ),
              )
            : null,
      ),
      // Responsive layout - show drawer on mobile, side-by-side on desktop
      drawer: _authenticated
          ? Drawer(
              child: _buildSidebar(),
            )
          : null,
      body: Row(
        children: [
          // Show sidebar only on larger screens and when authenticated
          if (_authenticated && MediaQuery.of(context).size.width > 1000)
            _buildSidebar(),
          // Content area
          Expanded(
            child: Container(
              color: const Color(0xFFF5F5FF),
              child: _buildContent(),
            ),
          ),
        ],
      ),
    );
  }
}

