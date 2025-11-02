"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ImageData {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

interface ImageGalleryProps {
  onSelect: (imagePath: string) => void;
  currentImage?: string;
}

export default function ImageGallery({ onSelect, currentImage }: ImageGalleryProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  const fetchImages = async () => {
    try {
      const response = await fetch("/api/admin/upload");
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      }
    } catch (error) {
      console.error("Failed to fetch images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setImages([data.image, ...images]);
        onSelect(data.image.path);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSelectImage = (imagePath: string) => {
    onSelect(imagePath);
    setIsOpen(false);
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 border border-coffee-300 hover:bg-coffee-50 text-sm"
        >
          Browse Images
        </button>
        {currentImage && (
          <div className="relative w-16 h-16 border border-coffee-300">
            <Image
              src={currentImage}
              alt="Current"
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-light text-coffee-900">
                Image Gallery
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-coffee-600 hover:text-coffee-900 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Upload Section */}
            <div className="mb-6 p-4 border-2 border-dashed border-coffee-300 text-center">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="text-coffee-700">
                  {uploading ? (
                    <p>Uploading...</p>
                  ) : (
                    <>
                      <p className="mb-2">Click to upload new image</p>
                      <p className="text-sm text-coffee-600">
                        Images will be saved permanently in your database
                      </p>
                    </>
                  )}
                </div>
              </label>
            </div>

            {/* Images Grid */}
            {loading ? (
              <p className="text-center text-coffee-600">Loading images...</p>
            ) : images.length === 0 ? (
              <p className="text-center text-coffee-600">
                No images yet. Upload your first image above!
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    onClick={() => handleSelectImage(image.path)}
                    className={`relative aspect-square cursor-pointer border-2 hover:border-coffee-500 transition-colors ${
                      currentImage === image.path
                        ? "border-coffee-700"
                        : "border-coffee-200"
                    }`}
                  >
                    <Image
                      src={image.path}
                      alt={image.originalName}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2">
                      <p className="text-xs truncate">{image.originalName}</p>
                      <p className="text-xs opacity-75">
                        {(image.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
