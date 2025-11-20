import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const handleComingSoon = (feature) => {
    Alert.alert('Coming Soon', `${feature} will be available in Phase 2!`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.first_name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.first_name || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {user?.subscription_tier?.toUpperCase() || 'FREE'}
            </Text>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleComingSoon('Profile Editing')}
          >
            <Icon name="account-edit" size={24} color="#9B8FC9" />
            <Text style={styles.menuItemText}>Edit Profile</Text>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleComingSoon('Cycle Settings')}
          >
            <Icon name="calendar-edit" size={24} color="#9B8FC9" />
            <Text style={styles.menuItemText}>Cycle Settings</Text>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Partner Mode Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partner Mode</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleComingSoon('Partner Mode')}
          >
            <Icon name="account-multiple" size={24} color="#F2A599" />
            <Text style={styles.menuItemText}>Invite Partner</Text>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Premium Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleComingSoon('Subscription')}
          >
            <Icon name="crown" size={24} color="#F2A599" />
            <Text style={styles.menuItemText}>Upgrade to Premium</Text>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Data & Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleComingSoon('Data Export')}
          >
            <Icon name="download" size={24} color="#9B8FC9" />
            <Text style={styles.menuItemText}>Export Data</Text>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleComingSoon('Privacy Settings')}
          >
            <Icon name="shield-lock" size={24} color="#9B8FC9" />
            <Text style={styles.menuItemText}>Privacy Settings</Text>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleComingSoon('Help Center')}
          >
            <Icon name="help-circle" size={24} color="#9B8FC9" />
            <Text style={styles.menuItemText}>Help Center</Text>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <Icon name="information" size={24} color="#9B8FC9" />
            <Text style={styles.menuItemText}>About Luna Sync</Text>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0 (MVP)</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5F1',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#9B8FC9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#3A3A3A',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#E8E5F0',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9B8FC9',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuItemText: {
    fontSize: 16,
    color: '#3A3A3A',
    marginLeft: 12,
    flex: 1,
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F2A599',
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  logoutButtonText: {
    color: '#F2A599',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginBottom: 40,
  },
});

export default ProfileScreen;
