import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../theme/app_theme.dart';

class CollegeAdminDashboard extends StatefulWidget {
  const CollegeAdminDashboard({super.key});

  @override
  State<CollegeAdminDashboard> createState() => _CollegeAdminDashboardState();
}

class _CollegeAdminDashboardState extends State<CollegeAdminDashboard> {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  String? _collegeId;
  String _collegeName = '';
  String _adminName = '';
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadCollegeData();
  }

  Future<void> _loadCollegeData() async {
    try {
      final uid = _auth.currentUser!.uid;
      final userDoc = await _firestore.collection('users').doc(uid).get();
      final userData = userDoc.data();
      
      if (userData != null) {
        final collegeId = userData['collegeId'];
        if (collegeId != null) {
          final collegeDoc = await _firestore.collection('colleges').doc(collegeId).get();
          final collegeData = collegeDoc.data();
          
          setState(() {
            _collegeId = collegeId;
            _collegeName = collegeData?['name'] ?? 'College';
            _adminName = userData['name'] ?? 'Admin';
            _loading = false;
          });
        }
      }
    } catch (e) {
      debugPrint('Error loading college data: $e');
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  Stream<QuerySnapshot> _getCollegeClubs() {
    return _firestore
        .collection('clubs')
        .where('collegeId', isEqualTo: _collegeId)
        .snapshots();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('College Admin Dashboard'),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () {
              // TODO: Implement notifications
            },
          ),
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () {
              // TODO: Implement profile
            },
          ),
        ],
      ),
      drawer: _buildDrawer(),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor))
          : _buildDashboard(),
    );
  }
  
  Widget _buildDrawer() {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF7C4DFF), Color(0xFF9E7DFF)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const CircleAvatar(
                  radius: 30,
                  backgroundColor: Colors.white,
                  child: Icon(
                    Icons.school,
                    size: 40,
                    color: Color(0xFF7C4DFF),
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  _collegeName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  'Admin: $_adminName',
                  style: const TextStyle(color: Colors.white70),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          ListTile(
            leading: const Icon(Icons.dashboard, color: AppTheme.primaryColor),
            title: const Text('Dashboard'),
            onTap: () => Navigator.pop(context),
          ),
          ListTile(
            leading: const Icon(Icons.groups, color: AppTheme.primaryColor),
            title: const Text('Manage Clubs'),
            onTap: () {
              Navigator.pop(context);
              // TODO: Navigate to clubs management page
            },
          ),
          ListTile(
            leading: const Icon(Icons.event, color: AppTheme.primaryColor),
            title: const Text('Events Calendar'),
            onTap: () {
              Navigator.pop(context);
              // TODO: Navigate to events calendar page
            },
          ),
          ListTile(
            leading: const Icon(Icons.campaign, color: AppTheme.primaryColor),
            title: const Text('Announcements'),
            onTap: () {
              Navigator.pop(context);
              // TODO: Navigate to announcements page
            },
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.settings, color: AppTheme.primaryColor),
            title: const Text('College Settings'),
            onTap: () {
              Navigator.pop(context);
              // TODO: Navigate to settings page
            },
          ),
          ListTile(
            leading: const Icon(Icons.logout, color: AppTheme.primaryColor),
            title: const Text('Logout'),
            onTap: () async {
              await FirebaseAuth.instance.signOut();
              Navigator.pushReplacementNamed(context, '/');
            },
          ),
        ],
      ),
    );
  }
  
  Widget _buildDashboard() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Welcome Card
          _buildWelcomeCard(),
          const SizedBox(height: 20),
          
          // Overview Cards
          _buildSectionTitle('Overview', Icons.analytics),
          _buildOverviewCards(),
          const SizedBox(height: 20),
          
          // College Clubs
          _buildSectionTitle('College Clubs', Icons.groups),
          _buildCollegeClubs(),
          const SizedBox(height: 20),
          
          // Quick Actions
          _buildSectionTitle('Quick Actions', Icons.flash_on),
          _buildQuickActions(),
        ],
      ),
    );
  }
  
  Widget _buildWelcomeCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF7C4DFF), Color(0xFF9E7DFF)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.purple.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const CircleAvatar(
                radius: 25,
                backgroundColor: Colors.white,
                child: Icon(
                  Icons.school,
                  size: 30,
                  color: Color(0xFF7C4DFF),
                ),
              ),
              const SizedBox(width: 15),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _collegeName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      'Welcome back, $_adminName',
                      style: const TextStyle(color: Colors.white70),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Text(
            'College Overview',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildStatCard('Clubs', '8', Icons.groups),
              _buildStatCard('Students', '450', Icons.school),
              _buildStatCard('Events', '12', Icons.event),
            ],
          ),
        ],
      ),
    );
  }
  
  Widget _buildStatCard(String title, String count, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 15),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Icon(icon, color: Colors.white),
          const SizedBox(height: 5),
          Text(
            count,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            title,
            style: const TextStyle(color: Colors.white70),
          ),
        ],
      ),
    );
  }
  
  Widget _buildSectionTitle(String title, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, color: AppTheme.primaryColor),
          const SizedBox(width: 8),
          Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF7C4DFF),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildOverviewCards() {
    final overviewItems = [
      {'title': 'Total Clubs', 'count': '8', 'icon': Icons.groups, 'color': AppTheme.primaryColor},
      {'title': 'Active Students', 'count': '450', 'icon': Icons.school, 'color': AppTheme.successColor},
      {'title': 'Events This Month', 'count': '12', 'icon': Icons.event, 'color': AppTheme.warningColor},
      {'title': 'Pending Approvals', 'count': '3', 'icon': Icons.pending_actions, 'color': AppTheme.secondaryColor},
    ];
    
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 1.8,
      ),
      itemCount: overviewItems.length,
      itemBuilder: (context, index) {
        final item = overviewItems[index];
        return _buildOverviewCard(
          title: item['title'] as String,
          count: item['count'] as String,
          icon: item['icon'] as IconData,
          color: item['color'] as Color,
        );
      },
    );
  }
  
  Widget _buildOverviewCard({
    required String title,
    required String count,
    required IconData icon,
    required Color color,
  }) {
    return StatefulBuilder(
      builder: (context, setState) {
        bool isHovered = false;
        
        return MouseRegion(
          onEnter: (_) => setState(() => isHovered = true),
          onExit: (_) => setState(() => isHovered = false),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: color.withOpacity(isHovered ? 0.3 : 0.1),
                  blurRadius: isHovered ? 10 : 5,
                  offset: isHovered ? const Offset(0, 5) : const Offset(0, 2),
                  spreadRadius: isHovered ? 1 : 0,
                ),
              ],
              gradient: isHovered
                  ? LinearGradient(
                      colors: [
                        Colors.white,
                        color.withOpacity(0.05),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    )
                  : null,
            ),
            transform: isHovered
                ? (Matrix4.identity()..translate(0, -3))
                : Matrix4.identity(),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      icon,
                      color: color,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          count,
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: color,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          title,
                          style: const TextStyle(
                            fontSize: 14,
                            color: Colors.black87,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
  
  Widget _buildCollegeClubs() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Your College Clubs',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                ElevatedButton.icon(
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('Create Club'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF7C4DFF),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  onPressed: () => Navigator.pushNamed(context, '/create-club'),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          SizedBox(
            height: 300,
            child: StreamBuilder<QuerySnapshot>(
              stream: _getCollegeClubs(),
              builder: (context, snapshot) {
                if (!snapshot.hasData) {
                  return const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor));
                }
                final docs = snapshot.data!.docs;
                if (docs.isEmpty) {
                  return const Center(
                    child: Padding(
                      padding: EdgeInsets.all(24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.groups_outlined, size: 48, color: AppTheme.textSecondaryColor),
                          SizedBox(height: 16),
                          Text(
                            'No clubs created yet',
                            style: TextStyle(fontSize: 16, color: Colors.grey),
                          ),
                          SizedBox(height: 8),
                          Text(
                            'Create your first club to get started',
                            style: TextStyle(color: Colors.grey),
                          ),
                        ],
                      ),
                    ),
                  );
                }
                return ListView.separated(
                  itemCount: docs.length,
                  separatorBuilder: (context, index) => const Divider(height: 1),
                  itemBuilder: (context, index) {
                    final data = docs[index].data() as Map<String, dynamic>;
                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: Colors.purple.withOpacity(0.1),
                        child: Icon(
                          _getClubIcon(data['category'] as String? ?? ''),
                          color: const Color(0xFF7C4DFF),
                        ),
                      ),
                      title: Text(data['name'] ?? ''),
                      subtitle: Text(data['category'] ?? ''),
                      trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                      onTap: () {
                        // TODO: Navigate to club details
                      },
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
  
  IconData _getClubIcon(String category) {
    switch (category.toLowerCase()) {
      case 'technology':
      case 'coding':
      case 'programming':
        return Icons.code;
      case 'music':
      case 'band':
      case 'choir':
        return Icons.music_note;
      case 'sports':
      case 'athletics':
        return Icons.sports_basketball;
      case 'art':
      case 'painting':
      case 'drawing':
        return Icons.palette;
      case 'science':
      case 'research':
        return Icons.science;
      case 'photography':
        return Icons.camera_alt;
      case 'dance':
        return Icons.music_note;
      default:
        return Icons.groups;
    }
  }
  
  Widget _buildQuickActions() {
    final actions = [
      {'title': 'Create Club', 'icon': Icons.add_circle, 'color': AppTheme.successColor},
      {'title': 'Approve Requests', 'icon': Icons.check_circle, 'color': AppTheme.secondaryColor},
      {'title': 'Post Announcement', 'icon': Icons.campaign, 'color': AppTheme.warningColor},
      {'title': 'View Reports', 'icon': Icons.bar_chart, 'color': AppTheme.primaryColor},
    ];
    
    return SizedBox(
      height: 100,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: actions.length,
        itemBuilder: (context, index) {
          final action = actions[index];
          return Container(
            width: 100,
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.1),
                  blurRadius: 5,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: (action['color'] as Color).withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    action['icon'] as IconData,
                    color: action['color'] as Color,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  action['title'] as String,
                  style: const TextStyle(fontSize: 12),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
