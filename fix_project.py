import os

# Define the missing files
missing_files = [
    "trendguard/__init__.py",
    "trendguard/explainability/__init__.py",
    "trendguard/hmm_engine/__init__.py",
    "trendguard/utils/__init__.py"
]

print("🔧 Fixing Project Structure...")

for file_path in missing_files:
    # Ensure folder exists first
    folder = os.path.dirname(file_path)
    if not os.path.exists(folder):
        os.makedirs(folder)
        print(f"   Created folder: {folder}")
    
    # Create the empty __init__.py file
    if not os.path.exists(file_path):
        with open(file_path, "w") as f:
            pass # Create empty file
        print(f"✅ Created: {file_path}")
    else:
        print(f"   Already exists: {file_path}")

print("\n🎉 Fix complete! You can now run 'python main_pipeline.py'")