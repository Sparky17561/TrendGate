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
            border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer group
            ${isDragging
                            ? 'border-cyan-400 bg-cyan-500/10 scale-[1.02]'
                            : 'border-white/30 hover:border-cyan-400/60 hover:bg-gradient-to-br hover:from-cyan-500/5 hover:to-transparent'
                        }
          `}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('post-file-input').click()}
                >
                    <div className="flex flex-col items-center gap-5">
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center border border-cyan-500/30 transition-transform ${isDragging ? 'scale-110' : 'group-hover:scale-105'}`}>
                            <Upload className="w-10 h-10 text-cyan-400" />
                        </div>

                        <div>
                            <p className="text-white font-bold text-lg mb-2">Upload Post for Analysis</p>
                            <p className="text-base text-gray-300 mb-1">
                                Drag & drop or click to upload
                            </p>
                            <p className="text-sm text-gray-400 mt-3 bg-white/5 px-4 py-2 rounded-lg inline-block border border-white/10">
                                Supports: Images (PNG, JPG, WEBP) or Text files
                            </p>
                        </div>

                        <div className="flex gap-6 mt-2">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                <ImageIcon className="w-5 h-5 text-purple-400" />
                                <span className="text-sm text-purple-300 font-medium">Image Post</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                <FileText className="w-5 h-5 text-blue-400" />
                                <span className="text-sm text-blue-300 font-medium">Text Post</span>
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
                <div className="border border-cyan-500/30 rounded-2xl p-6 bg-gradient-to-br from-cyan-500/5 to-transparent">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${isProcessing ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-emerald-500/20 border border-emerald-500/30'}`}>
                                {isProcessing ? (
                                    <Loader className="w-6 h-6 text-amber-400 animate-spin" />
                                ) : (
                                    <Check className="w-6 h-6 text-emerald-400" />
                                )}
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg">
                                    {isProcessing ? 'Processing...' : '✓ Post Uploaded Successfully'}
                                </p>
                                <p className="text-sm text-gray-300 mt-1">{file.name}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleClear}
                            className="p-2.5 hover:bg-red-500/20 rounded-xl transition-all border border-transparent hover:border-red-500/30 group"
                        >
                            <X className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
                        </button>
                    </div>

                    {/* Preview */}
                    {preview && (
                        <div className="mb-4 p-2 bg-black/20 rounded-xl border border-white/10">
                            <img
                                src={preview}
                                alt="Post preview"
                                className="w-full h-auto rounded-lg"
                                style={{ maxHeight: '300px', objectFit: 'contain' }}
                            />
                        </div>
                    )}

                    {/* Extracted Text */}
                    {extractedText && !isProcessing && (
                        <div className="p-5 bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl border border-purple-500/20">
                            <div className="flex items-center gap-2 text-sm text-purple-300 mb-3 font-semibold">
                                <FileText className="w-4 h-4" />
                                Content to Analyze:
                            </div>
                            <p className="text-base text-gray-200 leading-relaxed">
                                {extractedText.length > 200
                                    ? extractedText.substring(0, 200) + '...'
                                    : extractedText
                                }
                            </p>
                        </div>
                    )}

                    <div className="mt-5 p-4 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-xl border border-cyan-500/20 flex items-center gap-2 text-sm text-cyan-300">
                        <span className="text-lg">✨</span>
                        <span>This post will be analyzed by Gemini AI along with your campaign data</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PostUpload;
