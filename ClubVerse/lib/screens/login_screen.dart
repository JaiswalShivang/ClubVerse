import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../auth/auth_service.dart';
import '../services/user_service.dart';
import '../widgets/loading_spinner.dart';
import '../theme/app_theme.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with TickerProviderStateMixin {
  final _studentEmailController = TextEditingController();
  final _studentPasswordController = TextEditingController();

  final _adminEmailController = TextEditingController();
  final _adminPasswordController = TextEditingController();

  int _adminType = 0;
  late TabController _tabController;
  bool _isLoading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  Future<void> _handleLogin(String email, String password) async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final user = await AuthService().login(email, password);
      final role = (await UserService().getUserRole(user!.uid))['role'];

      switch (role) {
        case 'student':
          Navigator.pushReplacementNamed(context, '/student-dashboard');
          break;
        case 'college_admin':
          Navigator.pushReplacementNamed(context, '/college-admin-dashboard');
          break;
        case 'club_admin':
          Navigator.pushReplacementNamed(context, '/club-dashboard');
          break;
        case 'super_admin':
          Navigator.pushReplacementNamed(context, '/super-admin-dashboard');
          break;
        default:
          throw Exception("Unknown role: $role");
      }
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _isLoading = false);
    }
  }

  // No longer needed as we've implemented custom input fields directly in the tabs

  Widget _studentTab() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Username/Email field
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFFF5F5FF),
              borderRadius: BorderRadius.circular(12),
            ),
            child: TextField(
              controller: _studentEmailController,
              decoration: const InputDecoration(
                hintText: 'Email',
                prefixIcon: Icon(Icons.person_outline),
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ),
          const SizedBox(height: 16),
          // Password field
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFFF5F5FF),
              borderRadius: BorderRadius.circular(12),
            ),
            child: TextField(
              controller: _studentPasswordController,
              obscureText: true,
              decoration: const InputDecoration(
                hintText: 'Password',
                prefixIcon: Icon(Icons.lock_outline),
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ),
          const SizedBox(height: 24),
          // Login button
          SizedBox(
            width: 120,
            child: ElevatedButton(
              onPressed: () {
                final email = _studentEmailController.text.trim();
                final pass = _studentPasswordController.text.trim();
                if (email.isEmpty || pass.isEmpty || !email.contains('@')) {
                  setState(() => _error = "Enter a valid email and password");
                } else {
                  _handleLogin(email, pass);
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF7C4DFF),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text('Login'),
            ),
          ),
          const SizedBox(height: 24),
          // Login with others
          const Text(
            'Login with Others',
            style: TextStyle(
              color: Colors.grey,
            ),
          ),
          const SizedBox(height: 16),
          // Social login buttons
          Row(
            children: [
              // Google login
              OutlinedButton.icon(
                onPressed: () {
                  // TODO: Implement Google sign-in
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Google sign-in not implemented yet')),
                  );
                },
                icon: SvgPicture.asset(
                  'assets/images/google_logo.svg',
                  height: 18,
                  width: 18,
                ),
                label: const Text('Login with google'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.black87,
                  side: const BorderSide(color: Colors.grey),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
            ],
          ),
          const Spacer(),
          // Register link
          Center(
            child: TextButton(
              onPressed: () => Navigator.pushNamed(context, '/register'),
              child: const Text(
                "Don't have an account? Register",
                style: TextStyle(color: Color(0xFF7C4DFF)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _adminTab() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Admin type selector
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFFF5F5FF),
              borderRadius: BorderRadius.circular(12),
            ),
            padding: const EdgeInsets.all(4),
            child: SegmentedButton<int>(
              segments: const [
                ButtonSegment(value: 0, label: Text('College Admin')),
                ButtonSegment(value: 1, label: Text('Club Admin')),
              ],
              selected: {_adminType},
              onSelectionChanged: (s) => setState(() => _adminType = s.first),
              style: ButtonStyle(
                backgroundColor: MaterialStateProperty.resolveWith<Color>(
                  (Set<MaterialState> states) {
                    if (states.contains(MaterialState.selected)) {
                      return const Color(0xFF7C4DFF);
                    }
                    return Colors.transparent;
                  },
                ),
                foregroundColor: MaterialStateProperty.resolveWith<Color>(
                  (Set<MaterialState> states) {
                    if (states.contains(MaterialState.selected)) {
                      return Colors.white;
                    }
                    return AppTheme.textLightColor;
                  },
                ),
                textStyle: MaterialStateProperty.resolveWith<TextStyle>(
                  (Set<MaterialState> states) {
                    return const TextStyle(fontWeight: FontWeight.w500);
                  },
                ),
                shape: MaterialStateProperty.all<OutlinedBorder>(
                  RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                overlayColor: MaterialStateProperty.all(Colors.transparent),
                shadowColor: MaterialStateProperty.all(Colors.transparent),
              ),
            ),
          ),
          const SizedBox(height: 20),
          // Email field
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFFF5F5FF),
              borderRadius: BorderRadius.circular(12),
            ),
            child: TextField(
              controller: _adminEmailController,
              decoration: const InputDecoration(
                hintText: 'Email',
                prefixIcon: Icon(Icons.person_outline),
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ),
          const SizedBox(height: 16),
          // Password field
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFFF5F5FF),
              borderRadius: BorderRadius.circular(12),
            ),
            child: TextField(
              controller: _adminPasswordController,
              obscureText: true,
              decoration: const InputDecoration(
                hintText: 'Password',
                prefixIcon: Icon(Icons.lock_outline),
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ),
          const SizedBox(height: 24),
          // Login button
          SizedBox(
            width: 120,
            child: ElevatedButton(
              onPressed: () {
                final email = _adminEmailController.text.trim();
                final pass = _adminPasswordController.text.trim();
                if (email.isEmpty || pass.isEmpty || !email.contains('@')) {
                  setState(() => _error = "Enter a valid email and password");
                } else {
                  _handleLogin(email, pass);
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF7C4DFF),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text('Login'),
            ),
          ),
          const Spacer(),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Row(
          children: [
            // Left side with login form
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Logo
                    const Text(
                      'UNICLUB',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF7C4DFF),
                      ),
                    ),
                    const SizedBox(height: 40),
                    // Login title and tabs
                    const Text(
                      'LOGIN',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    TabBar(
                      controller: _tabController,
                      tabs: const [
                        Tab(text: 'Student'),
                        Tab(text: 'Admin'),
                      ],
                      labelColor: const Color(0xFF7C4DFF),
                      unselectedLabelColor: Colors.grey,
                      indicatorColor: const Color(0xFF7C4DFF),
                    ),
                    if (_isLoading)
                      const Padding(
                        padding: EdgeInsets.all(24),
                        child: LoadingSpinner(),
                      )
                    else
                      Expanded(
                        child: TabBarView(
                          controller: _tabController,
                          children: [_studentTab(), _adminTab()],
                        ),
                      ),
                    if (_error != null)
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Text(
                          _error!,
                          style: const TextStyle(color: Colors.red, fontSize: 16),
                        ),
                      ),
                  ],
                ),
              ),
            ),
            // Right side with image and text
            Expanded(
              child: Container(
                color: const Color(0xFF7C4DFF),
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(24),
                          ),
                          child: Column(
                            children: [
                              const Text(
                                'CONNECT\nWITH YOUR\nCOLLEGE\nPEERS!',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  height: 1.5,
                                ),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 24),
                              // Placeholder for student image
                              Container(
                                height: 200,
                                width: 200,
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.3),
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: const Center(
                                  child: Icon(
                                    Icons.person,
                                    size: 100,
                                    color: Colors.white,
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
              ),
            ),
          ],
        ),
      ),
    );
  }
}
