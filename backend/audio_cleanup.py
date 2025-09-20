# audio_cleanup.py
import os
import glob
import time
import threading
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class AudioCleanupService:
    """Service to clean up old audio files automatically"""
    
    def __init__(self, max_age_minutes=60, cleanup_interval_minutes=30):
        """
        Initialize cleanup service
        
        Args:
            max_age_minutes: Files older than this will be deleted (default: 60 minutes)
            cleanup_interval_minutes: How often to run cleanup (default: 30 minutes)
        """
        self.max_age_minutes = max_age_minutes
        self.cleanup_interval_minutes = cleanup_interval_minutes
        self.cleanup_thread = None
        self.running = False
        
        # Track files that are currently being served (to avoid deleting active files)
        self.active_files = set()
        self.active_files_lock = threading.Lock()
    
    def mark_file_active(self, filename):
        """Mark a file as currently being served"""
        with self.active_files_lock:
            self.active_files.add(filename)
            logger.debug(f"Marked file as active: {filename}")
    
    def mark_file_inactive(self, filename):
        """Mark a file as no longer being served"""
        with self.active_files_lock:
            self.active_files.discard(filename)
            logger.debug(f"Marked file as inactive: {filename}")
    
    def cleanup_old_files(self):
        """Remove old audio files"""
        try:
            # Find all audio files
            audio_patterns = [
                "response_audio_*.wav",
                "tts_output_*.wav", 
                "vad_test*.wav",
                "test_*.wav"
            ]
            
            current_time = time.time()
            max_age_seconds = self.max_age_minutes * 60
            files_deleted = 0
            
            for pattern in audio_patterns:
                for filepath in glob.glob(pattern):
                    try:
                        # Check file age
                        file_age = current_time - os.path.getmtime(filepath)
                        
                        # Skip if file is too new or currently active
                        if file_age < max_age_seconds:
                            continue
                            
                        with self.active_files_lock:
                            if filepath in self.active_files:
                                logger.debug(f"Skipping active file: {filepath}")
                                continue
                        
                        # Delete the file
                        os.remove(filepath)
                        files_deleted += 1
                        logger.info(f"Deleted old audio file: {filepath} (age: {file_age/60:.1f} minutes)")
                        
                    except OSError as e:
                        logger.warning(f"Could not delete file {filepath}: {e}")
            
            if files_deleted > 0:
                logger.info(f"Cleaned up {files_deleted} old audio files")
            else:
                logger.debug("No old audio files to clean up")
                
        except Exception as e:
            logger.error(f"Error during audio cleanup: {e}")
    
    def cleanup_specific_file(self, filename, delay_seconds=30):
        """
        Schedule a specific file for deletion after a delay
        This is useful for cleaning up files shortly after they're served
        """
        def delayed_cleanup():
            try:
                time.sleep(delay_seconds)
                if os.path.exists(filename):
                    # Double-check it's not active
                    with self.active_files_lock:
                        if filename not in self.active_files:
                            os.remove(filename)
                            logger.info(f"Deleted served audio file: {filename}")
                        else:
                            logger.debug(f"File still active, keeping: {filename}")
            except Exception as e:
                logger.warning(f"Could not delete file {filename}: {e}")
        
        # Run cleanup in background thread
        cleanup_thread = threading.Thread(target=delayed_cleanup, daemon=True)
        cleanup_thread.start()
    
    def _cleanup_loop(self):
        """Background cleanup loop"""
        while self.running:
            self.cleanup_old_files()
            
            # Sleep in small intervals so we can stop quickly
            for _ in range(self.cleanup_interval_minutes * 6):  # 6 * 10s = 1 minute
                if not self.running:
                    break
                time.sleep(10)
    
    def start_background_cleanup(self):
        """Start automatic background cleanup"""
        if self.running:
            logger.warning("Cleanup service already running")
            return
            
        self.running = True
        self.cleanup_thread = threading.Thread(target=self._cleanup_loop, daemon=True)
        self.cleanup_thread.start()
        logger.info(f"Started audio cleanup service (max_age: {self.max_age_minutes}min, interval: {self.cleanup_interval_minutes}min)")
    
    def stop_background_cleanup(self):
        """Stop automatic background cleanup"""
        self.running = False
        if self.cleanup_thread:
            self.cleanup_thread.join(timeout=5)
            logger.info("Stopped audio cleanup service")
    
    def emergency_cleanup(self):
        """Force immediate cleanup of all audio files (except active ones)"""
        logger.warning("Running emergency cleanup - deleting all audio files except active ones")
        
        audio_patterns = [
            "response_audio_*.wav",
            "tts_output_*.wav", 
            "vad_test*.wav",
            "test_*.wav"
        ]
        
        files_deleted = 0
        for pattern in audio_patterns:
            for filepath in glob.glob(pattern):
                try:
                    with self.active_files_lock:
                        if filepath not in self.active_files:
                            os.remove(filepath)
                            files_deleted += 1
                            logger.info(f"Emergency deleted: {filepath}")
                except OSError as e:
                    logger.warning(f"Could not delete file {filepath}: {e}")
        
        logger.warning(f"Emergency cleanup completed - deleted {files_deleted} files")

# Global instance
audio_cleanup = AudioCleanupService(max_age_minutes=30, cleanup_interval_minutes=15)

def init_cleanup_service():
    """Initialize and start the cleanup service"""
    audio_cleanup.start_background_cleanup()

def cleanup_audio_file(filename, delay_seconds=30):
    """Schedule a specific audio file for cleanup"""
    audio_cleanup.cleanup_specific_file(filename, delay_seconds)

def mark_audio_active(filename):
    """Mark an audio file as currently being served"""
    audio_cleanup.mark_file_active(filename)

def mark_audio_inactive(filename):
    """Mark an audio file as no longer being served"""
    audio_cleanup.mark_file_inactive(filename)

if __name__ == "__main__":
    # Test the cleanup service
    logging.basicConfig(level=logging.INFO)
    cleanup_service = AudioCleanupService(max_age_minutes=1, cleanup_interval_minutes=1)
    cleanup_service.start_background_cleanup()
    
    try:
        # Let it run for a bit
        time.sleep(120)
    except KeyboardInterrupt:
        pass
    finally:
        cleanup_service.stop_background_cleanup()