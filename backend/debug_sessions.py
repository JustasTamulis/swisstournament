import os
import sys
import base64
import django

# Set up Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.app.settings")
django.setup()

from django.conf import settings
from django.contrib.sessions.models import Session
from django.core import signing

def debug_sessions():
    print("Django Session Debugger")
    print("======================")
    print(f"Django Version: {django.get_version()}")
    print(f"Session Engine: {settings.SESSION_ENGINE if hasattr(settings, 'SESSION_ENGINE') else 'default'}")
    print(f"Secret Key Length: {len(settings.SECRET_KEY)}")
    print(f"Secret Key Prefix: {settings.SECRET_KEY[:8]}...")
    print("\nSession Records:")
    
    sessions = Session.objects.all()
    if not sessions:
        print("No sessions found in database.")
        return
    
    for session in sessions:
        print(f"\n- Session ID: {session.session_key}")
        print(f"  Expires: {session.expire_date}")
        print(f"  Data Length: {len(session.session_data)}")
        
        # Raw data analysis
        try:
            print("  Data Decoding:")
            # Try to manually decode the session data
            encoded_data = session.session_data
            try:
                # First part: base64 decoding
                base64_data = encoded_data.split(":", 1)[1]
                decoded_data = base64.b64decode(base64_data.encode())
                print(f"    Base64 decoded: Success ({len(decoded_data)} bytes)")
            except Exception as e:
                print(f"    Base64 decoded: Failed - {str(e)}")
            
            # Try Django's decoder
            try:
                decoded = session.get_decoded()
                print(f"    Django decoded: Success - {decoded}")
            except Exception as e:
                print(f"    Django decoded: Failed - {str(e)}")
        except Exception as e:
            print(f"  Error analyzing session: {str(e)}")

if __name__ == "__main__":
    debug_sessions()
