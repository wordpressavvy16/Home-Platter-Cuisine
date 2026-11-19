
import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import * as geminiService from '../services/geminiService';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';
import { SparklesIcon, CameraIcon, ImageUploadIcon, XMarkIcon } from '../constants';

interface ImageSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (dishName: string) => void;
}

const ImageSearchModal: React.FC<ImageSearchModalProps> = ({ isOpen, onClose, onComplete }) => {
    const { token } = useAuth();
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const modalRoot = document.getElementById('modal-root');
    if (!isOpen || !modalRoot) return null;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            stopCamera();
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setImageSrc(e.target?.result as string);
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handleAnalyze = async () => {
        if (!imageFile || !token) {
            setError("Please provide an image and ensure you are logged in.");
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onloadend = async () => {
                try {
                    const base64data = (reader.result as string).split(',')[1];
                    const result = await geminiService.identifyDishFromImage(base64data, imageFile.type, token);
                    if (result && result.dishName) {
                        onComplete(result.dishName); // Pass the dish name back
                    } else {
                        setError('AI could not identify a dish from this image. Please try another.');
                         setIsLoading(false);
                    }
                } catch (err: any) {
                    setError(err.message || 'Failed to analyze image.');
                    setIsLoading(false);
                }
            };
        } catch (err: any) {
            setError(err.message || 'Failed to read the image file.');
            setIsLoading(false);
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setVideoStream(stream);
            if(videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setImageSrc(null);
            setImageFile(null);
            setError('');
        } catch (err) {
            console.error("Camera access denied:", err);
            setError("Camera access was denied. Please enable it in your browser settings.");
        }
    };
    
    const stopCamera = () => {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            setVideoStream(null);
        }
    };

    const takePicture = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(blob => {
                if (blob) {
                    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                    setImageFile(file);
                    setImageSrc(canvas.toDataURL('image/jpeg'));
                }
            }, 'image/jpeg');
            stopCamera();
        }
    };
    
    const reset = () => {
        setImageSrc(null);
        setImageFile(null);
        setError('');
        stopCamera();
        if(fileInputRef.current) fileInputRef.current.value = "";
    };
    
    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in p-4" onClick={onClose}>
            <div role="dialog" aria-modal="true" aria-labelledby="image-search-modal-title" className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 id="image-search-modal-title" className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>Search by Image</h2>
                    <button onClick={onClose} aria-label="Close image search" className="p-2 rounded-full hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <p className="text-gray-600 mb-4 text-center">Upload a photo of a dish and our AI will find similar meals for you.</p>

                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg min-h-[250px] mb-4">
                        {imageSrc && !videoStream && <img src={imageSrc} alt="Ingredient" className="max-h-48 rounded-lg" />}
                        {videoStream && (
                            <div className="w-full">
                                <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg mb-4"></video>
                                <button onClick={takePicture} className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600">Take Picture</button>
                            </div>
                        )}
                        {!imageSrc && !videoStream && (
                            <div className="text-center">
                                <ImageUploadIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                                <div className="flex gap-4 justify-center">
                                    <button onClick={() => fileInputRef.current?.click()} className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600">Upload File</button>
                                    <button onClick={startCamera} className="bg-purple-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-600 flex items-center gap-2"><CameraIcon className="w-5 h-5"/>Use Camera</button>
                                </div>
                            </div>
                        )}
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                    {(imageFile || error) && !isLoading && (
                        <div className="flex gap-2">
                            <button onClick={handleAnalyze} disabled={isLoading || !imageFile} className="w-full flex-grow bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-dark flex items-center justify-center gap-2 disabled:bg-gray-400">
                                <SparklesIcon className="w-5 h-5"/> Analyze & Search
                            </button>
                            <button onClick={reset} className="bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-300">Reset</button>
                        </div>
                    )}

                    {isLoading && <Loader text="Analyzing image..." />}
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default ImageSearchModal;
