function initProductInfoModal(blockId) {
  const button = document.getElementById('toggle-btn-' + blockId);
  const modal = document.getElementById('modal-' + blockId);
  const overlay = document.getElementById('overlay-' + blockId);
  const closeBtn = document.getElementById('close-btn-' + blockId);
  
  if (!button || !modal || !overlay || !closeBtn) {
    console.error('Product Info Modal: Required elements not found for block ' + blockId);
    return;
  }
  
  if (overlay.parentElement !== document.body) {
    document.body.appendChild(overlay);
  }
  if (modal.parentElement !== document.body) {
    document.body.appendChild(modal);
  }
  
  function openModal(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    overlay.style.cssText = 'display: block !important; position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 2147483646 !important; background-color: rgba(0, 0, 0, 0.6) !important; pointer-events: auto !important; margin: 0 !important; padding: 0 !important;';
    
    var modalBgColor = modal.style.backgroundColor || '#ffffff';
    modal.style.cssText = 'display: block !important; position: fixed !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) scale(0.7) !important; z-index: 2147483647 !important; pointer-events: auto !important; width: 90% !important; max-width: 600px !important; max-height: 80vh !important; overflow-y: auto !important; padding: 30px !important; border-radius: 12px !important; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5) !important; margin: 0 !important; background-color: ' + modalBgColor + ' !important; opacity: 0;';
    
    void overlay.offsetWidth;
    void modal.offsetWidth;
    
    requestAnimationFrame(function() {
      overlay.classList.add('active');
      modal.classList.add('active');
      modal.style.opacity = '1';
      modal.style.transform = 'translate(-50%, -50%) scale(1)';
    });
    
    document.body.style.overflow = 'hidden';
    
    console.log('Modal opened - z-index:', modal.style.zIndex, 'position:', modal.style.position);
  }
  
  function closeModal(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    overlay.classList.remove('active');
    modal.classList.remove('active');
    
    setTimeout(function() {
      overlay.style.display = 'none';
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }, 300);
  }
  
  function handleEscape(e) {
    if (e.key === 'Escape' && modal.style.display === 'block') {
      closeModal();
    }
  }
  
  function handleOverlayClick(e) {
    if (e.target === overlay) {
      closeModal(e);
    }
  }
  
  button.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', handleOverlayClick);
  document.addEventListener('keydown', handleEscape);
}

window.initProductInfoModal = initProductInfoModal;
