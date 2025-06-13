import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ConnectionsHeader from "../components/ConnectionsHeader";
import Footer from "../components/Footer";
import "../styles/CreateBlogPost.css";

const CreateBlogPost = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [moreDescription, setMoreDescription] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState({
    title: 0,
    description: 0,
    moreDescription: 0
  });

  const authToken = localStorage.getItem("token");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    document.getElementById("image").value = "";
  };

  const handleInputChange = (field, value) => {
    switch (field) {
      case 'title':
        setTitle(value);
        setCharCount(prev => ({ ...prev, title: value.length }));
        break;
      case 'description':
        setDescription(value);
        setCharCount(prev => ({ ...prev, description: value.length }));
        break;
      case 'moreDescription':
        setMoreDescription(value);
        setCharCount(prev => ({ ...prev, moreDescription: value.length }));
        break;
      default:
        break;
    }
  };

  const handleHashtagChange = (e) => {
    const value = e.target.value;
    // Auto-format hashtags
    const formattedValue = value
      .split(',')
      .map(tag => tag.trim().startsWith('#') ? tag.trim() : tag.trim() ? `#${tag.trim()}` : '')
      .join(', ');
    setHashtags(formattedValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!authToken) {
      toast.error("You must be logged in to create a blog post.");
      setIsSubmitting(false);
      return;
    }

    // Validation
    if (title.length < 5) {
      toast.error("Title must be at least 5 characters long.");
      setIsSubmitting(false);
      return;
    }

    if (description.length < 20) {
      toast.error("Short description must be at least 20 characters long.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("moreDescription", moreDescription);
    formData.append(
      "hashtags",
      hashtags
        .split(",")
        .map((tag) => tag.trim().replace('#', ''))
        .filter((tag) => tag.length > 0)
        .join(",")
    );

    if (selectedImage) {
      formData.append("profilePic", selectedImage);
    }

    try {
      await axios.post("/api/v1/blogs/create", formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success("Blog post created successfully!");

      // Reset form
      setTitle("");
      setDescription("");
      setMoreDescription("");
      setHashtags("");
      setSelectedImage(null);
      setImagePreview(null);
      setCharCount({ title: 0, description: 0, moreDescription: 0 });
      document.getElementById("image").value = "";
    } catch (err) {
      console.error(
        "Error creating blog post:",
        err.response?.data || err.message
      );
      toast.error(
        `Failed to create blog post: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ConnectionsHeader />
      <div className="create-blog-container">
        <div className="create-blog-wrapper">
          <div className="blog-header">
            <h1 className="page-title">Create New Blog Post</h1>
            <p className="page-subtitle">Share your insights with the Jobizza Network community</p>
          </div>

          <div className="blog-form-container">
            <form onSubmit={handleSubmit} className="blog-form">
              <div className="form-section">
                <div className="input-group">
                  <label htmlFor="title" className="form-label">
                    Blog Title <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    className="form-input title-input"
                    value={title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter an engaging title for your blog post..."
                    maxLength="100"
                    required
                  />
                  <div className="char-count">
                    <span className={charCount.title < 5 ? 'error' : ''}>
                      {charCount.title}/100 characters {charCount.title < 5 && '(minimum 5)'}
                    </span>
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="description" className="form-label">
                    Short Description <span className="required">*</span>
                  </label>
                  <textarea
                    id="description"
                    className="form-textarea"
                    value={description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Write a compelling summary that will appear in blog previews..."
                    rows="4"
                    maxLength="300"
                    required
                  />
                  <div className="char-count">
                    <span className={charCount.description < 20 ? 'error' : ''}>
                      {charCount.description}/300 characters {charCount.description < 20 && '(minimum 20)'}
                    </span>
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="moreDescription" className="form-label">
                    Full Content
                  </label>
                  <div className="editor-toolbar">
                    <span className="toolbar-text">Rich text editor</span>
                  </div>
                  <textarea
                    id="moreDescription"
                    className="form-textarea content-textarea"
                    value={moreDescription}
                    onChange={(e) => handleInputChange('moreDescription', e.target.value)}
                    placeholder="Write your full blog content here. Share your expertise, insights, and valuable information with the community..."
                    rows="12"
                  />
                  <div className="char-count">
                    <span>{charCount.moreDescription.toLocaleString()} characters</span>
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="hashtags" className="form-label">
                    Hashtags
                  </label>
                  <input
                    type="text"
                    id="hashtags"
                    className="form-input"
                    value={hashtags}
                    onChange={handleHashtagChange}
                    placeholder="e.g., #leadership, #technology, #career"
                  />
                  <div className="hashtag-preview">
                    {hashtags && (
                      <div className="hashtag-list">
                        {hashtags.split(',').map((tag, index) => (
                          tag.trim() && (
                            <span key={index} className="hashtag-chip">
                              {tag.trim()}
                            </span>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="image" className="form-label">
                    Featured Image
                  </label>
                  <div className="image-upload-area">
                    {!imagePreview ? (
                      <div className="upload-placeholder">
                        <div className="upload-icon">📸</div>
                        <p>Click to upload or drag and drop</p>
                        <p className="upload-note">PNG, JPG, GIF up to 10MB</p>
                        <input
                          type="file"
                          id="image"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="file-input"
                        />
                      </div>
                    ) : (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Preview" className="preview-image" />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={removeImage}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    
                    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
                      window.history.back();
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting || !title || !description}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Publishing...
                    </>
                  ) : (
                    'Publish Blog Post'
                  )}
                </button>
              </div>
            </form>

            <div className="blog-tips">
              <h3>💡 Tips for a Great Blog Post</h3>
              <ul>
                <li>Use a clear, engaging title that describes your content</li>
                <li>Write a compelling short description to attract readers</li>
                <li>Include relevant hashtags to improve discoverability</li>
                <li>Add a high-quality featured image to make your post stand out</li>
                <li>Structure your content with clear paragraphs and sections</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CreateBlogPost;
