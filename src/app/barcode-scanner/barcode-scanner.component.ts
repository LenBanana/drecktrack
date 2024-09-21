import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCamera, faFileImage } from '@fortawesome/free-solid-svg-icons';
import { LOAD_WASM, NgxScannerQrcodeComponent, NgxScannerQrcodeModule, NgxScannerQrcodeService, ScannerQRCodeConfig, ScannerQRCodeResult, ScannerQRCodeSelectedFiles } from 'ngx-scanner-qrcode';


LOAD_WASM().subscribe();

@Component({
  selector: 'app-barcode-scanner',
  standalone: true,
  imports: [CommonModule, NgxScannerQrcodeModule, FontAwesomeModule],
  templateUrl: './barcode-scanner.component.html',
  styleUrl: './barcode-scanner.component.scss'
})
export class BarcodeScannerComponent {
  @Output() isbnScanned = new EventEmitter<string>();
  @ViewChild('action', { static: false }) scanner?: NgxScannerQrcodeComponent;
  scannedValues: string[] = [];
  loading: boolean = false;

  cameraIcon = faCamera;
  fileSearchIcon = faFileImage;

  constructor(private qrcodeService: NgxScannerQrcodeService) { }

  // Handle file input for barcode scanning
  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      this.barcodeScan(Array.from(files));
    }
  }

  // Scan barcodes from selected files
  barcodeScan(files: File[]) {
    if (files && files.length > 0) {
      this.loading = true;
      const config: ScannerQRCodeConfig = {};
      this.qrcodeService.loadFilesToScan(files, config).subscribe((res: ScannerQRCodeSelectedFiles[]) => {
        if (res && res.length > 0) {
          res.forEach((result) => {
            if (result && result.data && result.data.length > 0) {
              result.data.forEach((scanResult) => {
                const isbn = scanResult.value;
                if (!this.scannedValues.includes(isbn)) {
                  this.scannedValues.push(isbn);
                }
                this.isbnScanned.emit(isbn);
              });
            }
          });
        }
      }, (error) => {
        console.error('Error processing image:', error);
      }, () => {
        this.loading = false;
      });
    }
  }

  // Handle scan event from camera
  scanEvent(event: ScannerQRCodeResult[]) {
    const firstEvent = event[0];
    if (!event || !firstEvent.value) {
      return;
    }

    const isbn = firstEvent.value;
    if (!this.scannedValues.includes(isbn)) {
      this.scannedValues.push(isbn);
      this.isbnScanned.emit(isbn);
    }
  }

  // Set the camera for scanning
  setCamera() {
    this.scanner?.start();
    const devices = this.scanner?.devices.value;
    if (!devices) {
      return;
    }

    const environmentDevice = devices.find(f => (/back|rear|environment/gi.test(f.label))) ?? devices.pop();

    if (!environmentDevice) {
      return;
    }

    setTimeout(() => {
      this.scanner?.playDevice(environmentDevice?.deviceId);
    }, 1000);
  }

  // Stop the scanner when modal is closed
  stopScanner() {
    this.scanner?.stop();
  }
}