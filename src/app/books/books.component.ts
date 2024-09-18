import { Component, ViewChild } from '@angular/core';
import { BookSearch } from '../../interfaces/book-search';
import { BookService } from './book-service/book.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { faCamera, faFileImage, faMagnifyingGlass, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ImageCroppedEvent, ImageCropperComponent, LoadedImage } from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { LOAD_WASM, NgxScannerQrcodeComponent, NgxScannerQrcodeModule, NgxScannerQrcodeService, ScannerQRCodeConfig, ScannerQRCodeResult, ScannerQRCodeSelectedFiles } from 'ngx-scanner-qrcode';
import { BehaviorSubject } from 'rxjs';

LOAD_WASM().subscribe();
@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbTypeaheadModule, FontAwesomeModule, ImageCropperComponent, NgxScannerQrcodeModule],
  templateUrl: './books.component.html',
  styleUrl: './books.component.scss'
})
export class BooksComponent {
  imageChangedEvent: Event | null = null;
  croppedImage: SafeUrl = '';
  isbnTerm = '';
  selectedBooks: BookSearch[] = [];
  savedBooks: BookSearch[] = [];
  errorMessage: string | null = null;
  loadingMessage: string | null = null;
  bookUserId = '';
  currentCrop: ImageCroppedEvent | null = null;
  scannedValues: string[] = [];

  @ViewChild(NgxScannerQrcodeComponent) scanner?: NgxScannerQrcodeComponent;
  searchIcon = faMagnifyingGlass;
  fileSearchIcon = faFileImage;
  cameraIcon = faCamera;
  clearIcon = faTimes;

  constructor(private bookService: BookService, private sanitizer: DomSanitizer, private qrcode: NgxScannerQrcodeService) {
    this.bookUserId = bookService.getUserId();

    this.bookService.getSavedBooks().subscribe((books) => {
      this.savedBooks = books;
    }, (error) => {
      console.error('Error fetching books:', error);
    });

    this.setCamera();
  }

  setCamera() {
    const devices = this.scanner?.devices.value;
    if (!devices) {
      return;
    }

    const environmentDevice = devices.find(f => (/back|trás|rear|traseira|environment|ambiente/gi.test(f.label))) ?? devices.pop();

    if (!environmentDevice) {
      return;
    }

    this.scanner?.playDevice(environmentDevice?.deviceId);
  }

  imageCropped(event: ImageCroppedEvent) {
    if (!event.objectUrl) {
      return;
    }
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);
    // event.blob can be used to upload the cropped image
    this.currentCrop = event;
  }
  imageLoaded(image: LoadedImage) {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }
  scanEvent(event: ScannerQRCodeResult[]) {
    var firstEvent = event[0];
    if (!event || !firstEvent.value) {
      return;
    }

    if (this.scannedValues.includes(firstEvent.value)) {
      return;
    }
    console.log('Scan event:', firstEvent);

    this.scannedValues.push(firstEvent.value);
  }

  useCroppedImage() {
    if (!this.currentCrop) {
      return;
    }

    // Use imageocr to extract ISBN from blob
    let blob = this.currentCrop.blob;
    if (!blob) {
      return;
    }

    let file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
    this.imageOcr(file);
  }

  // Trigger ISBN search when user types
  isbnTextSearch(): void {
    if (this.isbnTerm.length >= 1) {
      this.selectedBooks = [];
      this.bookService.searchBookByISBN(this.isbnTerm).subscribe((bookSearch) => {
        bookSearch.forEach((book) => {
          this.selectedBooks.push(book);
        });
        this.errorMessage = null;
      }, (error) => {
        console.error('Error searching for ISBN:', error);
        this.errorMessage = 'Failed to search for the ISBN.';
      });
    }
  }

  // Handle file input for image-based ISBN search
  onFileSelected(event: Event): void {
    // Commented out to try barcode instead of OCR
    //this.imageChangedEvent = event;
    let target = event.target as HTMLInputElement;
    let files = target.files;
    if (files && files.length > 0) {
      this.barcodeScan(Array.from(files));
    }
  }

  barcodeScan(files: File[]) {
    if (files && files.length > 0) {
      this.loadingMessage = 'Processing image...';
      this.selectedBooks = [];
      this.isbnTerm = '';
      this.errorMessage = null;
      const config: ScannerQRCodeConfig = {};
      this.qrcode.loadFilesToScan(files, config).subscribe((res: ScannerQRCodeSelectedFiles[]) => {
        if (res && res.length > 0) {
          res.forEach((result) => {
            if (result && result.data && result.data.length > 0) {
              result.data.forEach((result) => {
                this.isbnTerm += result.value + ' ';
                this.bookService.searchBookByISBN(result.value).subscribe((bookSearch) => {
                  console.log('Book search:', bookSearch);
                  if (bookSearch.length === 0) {
                    this.errorMessage = 'No book details found.';
                    return;
                  }

                  bookSearch.forEach((book) => {
                    this.selectedBooks.push(book);
                  });
                  this.errorMessage = null;
                }, (error) => {
                  console.error('Error searching for ISBN:', error);
                  this.errorMessage = 'Failed to search for the ISBN.';
                });
              });
            }
          });
        }
      }, (error) => {
        console.error('Error processing image:', error);
        this.errorMessage = 'Failed to process the image.';
      }, () => {
        this.loadingMessage = null;
      });
    }
  }

  imageOcr(file: File) {
    this.selectedBooks = [];
    this.bookService.extractISBN(file).then((bookSearch) => {
      this.loadingMessage = null;
      if (bookSearch) {
        bookSearch.forEach((book) => {
          this.selectedBooks.push(book);
        });
        this.errorMessage = null;
        this.imageChangedEvent = null;
      } else {
        this.errorMessage = 'No book details found.';
      }
    }).catch((error) => {
      console.error('Error processing file:', error);
      this.loadingMessage = null;
      this.errorMessage = 'Failed to process the image.';
    });
  }

  addBook(selectedBook: BookSearch): void {
    this.bookService.saveBook(selectedBook).subscribe((bookSearch) => {
      if (selectedBook) {
        selectedBook.saved = true;
        this.savedBooks.push(selectedBook);
      }
    }, (error) => {
      console.error('Error saving book:', error);
    });
  }

  removeBook(book: BookSearch): void {
    this.bookService.deleteBook(book.id).subscribe(() => {
      this.savedBooks = this.savedBooks.filter((b) => b.isbn13 !== book.isbn13);
    }, (error) => {
      console.error('Error removing book:', error);
    });
  }

  inCollection(book: BookSearch): boolean {
    return this.savedBooks.some((b) => b.isbn13 === book.isbn13 || b.isbn10 === book.isbn10);
  }

  notInCollection(book: BookSearch): boolean {
    return !this.savedBooks.some((b) => b.isbn13 === book.isbn13 || b.isbn10 === book.isbn10);
  }
}
