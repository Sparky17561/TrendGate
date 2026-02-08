import { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, FileText, X, Check, Loader } from 'lucide-react';

/**
 * PostUpload Component
 * Drag-and-drop interface for uploading posts (images or text)
 * Extracted content is passed to parent for Gemini analysis
 */
export function PostUpload({ onPostExtracted, className = '' }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [extractedText, setExtractedText] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Handle file selection
    const handleFileSelect = useCallback((selectedFile) => {
        if (!selectedFile) return;

        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'text/plain'];
        if (!validTypes.includes(selectedFile.type)) {
            alert('Please upload an image (PNG, JPG, WEBP) or text file');
            return;
        }

        setFile(selectedFile);
        setIsProcessing(true);

        // Create preview for images
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target.result);
                // For now, just indicate image uploaded - backend will process with Gemini Vision
                setExtractedText(`[Image uploaded: ${selectedFile.name}]`);
                setIsProcessing(false);

                // Pass to parent
                onPostExtracted({
                    type: 'image',
                    filename: selectedFile.name,
                    preview: e.target.result,
                    content: `Analyze this uploaded post image: ${selectedFile.name}`
                });
            };
            reader.readAsDataURL(selectedFile);
        }
        // Handle text files
        else if (selectedFile.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                setExtractedText(text);
                setIsProcessing(false);

                // Pass to parent
                onPostExtracted({
                    type: 'text',
                    filename: selectedFile.name,
                    content: text
                });
            };
            reader.readAsText(selectedFile);
        }
    }, [onPostExtracted]);

    // Drag and drop handlers
    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        handleFileSelect(droppedFile);
    }, [handleFileSelect]);

    // Clear upload
    const handleClear = () => {
        setFile(null);
        setPreview(null);
        setExtractedText('');
        onPostExtracted(null);
    };

    return (
        <div className={`post-upload ${className}`}>
            {!file ? (
                <div
                    className={`
            border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
            ${isDragging
                            ? 'border-white bg-white/5'
                            : 'border-white/20 hover:border-white/40 hover:bg-white/[0.02]'
                        }
          `}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('post-file-input').click()}
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                            <Upload className="w-8 h-8 text-gray-400" />
                        </div>

                        <div>
                            <p className="text-white font-medium mb-1">Upload Post for Analysis</p>
                            <p className="text-sm text-gray-400">
                                Drag & drop or click to upload
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                Supports: Images (PNG, JPG, WEBP) or Text files
                            </p>
                        </div>

                        <div className="flex gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <ImageIcon className="w-4 h-4" />
                                <span>Image Post</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                <span>Text Post</span>
                            </div>
                        </div>
                    </div>

                    <input
                        id="post-file-input"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp,text/plain"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                    />
                </div>
            ) : (
                <div className="border border-white/10 rounded-xl p-6 bg-white/[0.02]">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {isProcessing ? (
                                <Loader className="w-5 h-5 text-white animate-spin" />
                            ) : (
                                <Check className="w-5 h-5 text-white" />
                            )}
                            <div>
                                <p className="text-white font-medium">
                                    {isProcessing ? 'Processing...' : 'Post Uploaded'}
                                </p>
                                <p className="text-sm text-gray-400">{file.name}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleClear}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Preview */}
                    {preview && (
                        <div className="mb-4">
                            <img
                                src={preview}
                                alt="Post preview"
                                className="max-w-full h-auto rounded-lg border border-white/10"
                                style={{ maxHeight: '300px' }}
                            />
                        </div>
                    )}

                    {/* Extracted Text */}
                    {extractedText && !isProcessing && (
                        <div className="p-4 bg-black/20 rounded-lg border border-white/5">
                            <div className="text-xs text-gray-400 mb-2">Content to Analyze:</div>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {extractedText.length > 200
                                    ? extractedText.substring(0, 200) + '...'
                                    : extractedText
                                }
                            </p>
                        </div>
                    )}

                    <div className="mt-4 text-xs text-gray-500">
                        ✨ This post will be analyzed by Gemini AI along with your campaign data
                    </div>
                </div>
            )}
        </div>
    );
}

export default PostUpload;
