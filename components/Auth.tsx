import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Alert, Linking } from 'react-native'
import { Input, Button } from '@rneui/themed'
import { supabase } from '../lib/supabase'
import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'

WebBrowser.maybeCompleteAuthSession()

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Handle OAuth session and deep linking
  useEffect(() => {
    // Handle the OAuth callback URL
    const handleDeepLink = async (url) => {
      console.log('Deep link received:', url)
      
      if (url.includes('#access_token=') || url.includes('?access_token=')) {
        try {
          // Let Supabase handle the OAuth callback
          const { data, error } = await supabase.auth.getSessionFromUrl({ url })
          if (error) {
            console.error('Session error:', error)
            Alert.alert('Authentication Error', error.message)
          } else if (data?.session) {
            console.log('Authentication successful!')
            Alert.alert('Success', 'Successfully signed in with Google!')
          }
        } catch (err) {
          console.error('Error processing OAuth callback:', err)
        }
      }
    }

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink)
    
    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url)
    })
    
    return () => subscription?.remove()
  }, [])

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) Alert.alert('Error', error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) Alert.alert('Error', error.message)
    else Alert.alert('Check your inbox for verification email.')
    setLoading(false)
  }

  async function signInWithGoogle() {
    setLoading(true)
    
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'sobol',
      })
      
      console.log('Redirect URI:', redirectUri)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error('OAuth Error:', error)
        Alert.alert('Google Sign-In Error', error.message)
        return
      }

      if (data?.url) {
        console.log('Opening OAuth URL:', data.url)
        
        // Open the OAuth URL in browser
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri,
          {
            showInRecents: true,
          }
        )
        
        console.log('WebBrowser result:', result)
        
        if (result.type === 'success' && result.url) {
          // Handle the callback URL
          console.log('Success URL:', result.url)
          
          try {
            // Use Supabase's method to extract session from URL
            const { data: sessionData, error: sessionError } = await supabase.auth.getSessionFromUrl({ url: result.url })
            
            if (sessionError) {
              console.error('Session error:', sessionError)
              Alert.alert('Authentication Error', sessionError.message)
            } else if (sessionData?.session) {
              console.log('Authentication successful!')
              Alert.alert('Success', 'Successfully signed in with Google!')
            } else {
              Alert.alert('Error', 'Failed to create session')
            }
          } catch (err) {
            console.error('Error processing callback:', err)
            Alert.alert('Error', 'Failed to process authentication callback')
          }
        } else if (result.type === 'cancel') {
          Alert.alert('Cancelled', 'Google sign-in was cancelled')
        } else if (result.type === 'dismiss') {
          Alert.alert('Dismissed', 'Google sign-in was dismissed')
        }
      }
    } catch (error) {
      console.error('Sign in error:', error)
      Alert.alert('Error', 'Failed to initiate Google sign-in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="email@example.com"
        autoCapitalize="none"
      />
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        autoCapitalize="none"
      />
      <Button title="Sign In" disabled={loading} onPress={signInWithEmail} />
      <Button title="Sign Up" disabled={loading} onPress={signUpWithEmail} />
      <Button 
        title={loading ? "Signing in..." : "Sign in with Google"} 
        disabled={loading} 
        onPress={signInWithGoogle} 
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
})