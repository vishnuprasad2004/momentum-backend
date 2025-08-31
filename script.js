const downloadBtn = document.getElementById('download-btn');
const qrDialog = document.getElementById('qr-dialog');

downloadBtn.addEventListener('click', function(event) {
  if(window.innerWidth > 768) {
    event.preventDefault(); 
    qrDialog.showModal();
  }  
    
});