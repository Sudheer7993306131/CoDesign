import cloudinary
import cloudinary.uploader

# Configuration (Use your credentials from Cloudinary dashboard)
cloudinary.config( 
  cloud_name = "your_cloud_name", 
  api_key = "your_api_key", 
  api_secret = "your_api_secret" 
)

def upload_design_asset(file_path, public_id):
    # Uploads and returns the secure URL
    response = cloudinary.uploader.upload(file_path, public_id=public_id)
    return response['secure_url']