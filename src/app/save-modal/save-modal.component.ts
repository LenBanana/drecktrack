import { Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { ShowStorageService } from '../../storage/storage.service';
import { KonamiService } from '../../konami/konami.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { faArrowUp, faCheck, faCopy, faLink, faLinkSlash, faSave, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SavedShow, ShowShare } from '../../interfaces/show';
import { ExportInfo } from '../../interfaces/export-info';
import { WsShareService } from '../../storage/ws-share.service';

@Component({
  selector: 'app-save-modal',
  standalone: true,
  imports: [NgbDatepickerModule, CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './save-modal.component.html',
  styleUrl: './save-modal.component.scss'
})
export class SaveModalComponent implements OnDestroy {
	private modalService = inject(NgbModal);

  @ViewChild("content") contentRef!: ElementRef;

  subscriptions = new Subscription();
	closeResult = '';
  jsonText = '';
  shareId = '';
  shareConnected = false;
  shareReceived = false;

  copyIcon = faCopy;
  importIcon = faArrowUp;
  saveIcon = faSave;
  closeIcon = faXmark;
  connectedIcon = faLinkSlash;

  shows: SavedShow[] = [];
  exportInfo!: ExportInfo;

  constructor(private storageService: ShowStorageService, private konamiService: KonamiService, private shareService: WsShareService) {    
    this.subscriptions.add(this.konamiService.konamiCodeEnteredSubject.subscribe(() => {
      storageService.exportJsonAsFile();
    }));

    this.subscriptions.add(this.shareService.shareReceived.subscribe((share) => {
      this.shows = share.shows;
      this.exportInfo = new ExportInfo(this.shows);
      this.shareReceived = true;
    }));

    this.shows = this.storageService.getShows();
    this.exportInfo = new ExportInfo(this.shows);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

	open() {
    this.shows = this.storageService.getShows();
    this.exportInfo = new ExportInfo(this.shows);
		this.modalService.open(this.contentRef, { ariaLabelledBy: 'modal-basic-title' }).result.then(
			(result) => {
				this.closeResult = `Closed with: ${result}`;
			},
			(reason) => {
				this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			},
		);
	}

  registerShare() {
    this.shareService.registerShare(this.storageService.getShareId());
    this.shareConnected = true;
    this.connectedIcon = faLink;
  }

  save() {
    this.storageService.saveShows(this.shows);
    this.shareReceived = false;
    this.saveIcon = faCheck;
    setTimeout(() => {
      this.saveIcon = faSave;
    }, 1000);
  }

  getShareId() {
    return this.storageService.getShareId();
  }

  shareShows() {
    if (!this.shareId || this.shareId.length < 5) {
      return;
    }

    const share: ShowShare = new ShowShare(this.shareId.toUpperCase(), this.shows);
    this.shareService.sendShows(share);
    this.shareId = '';
  }

  copyToClipboard() {
    const shows = this.storageService.copyToClipboard();
    this.exportInfo = new ExportInfo(shows);
    this.shows = shows;
    this.copyIcon = faCheck;
    setTimeout(() => {
      this.copyIcon = faCopy;
    }, 1000);
  }

  async getFromClipboard() {
    const shows = await this.storageService.getFromClipboard();
    if (!shows || shows.length === 0) {
      return;
    }

    this.exportInfo = new ExportInfo(shows);
    this.shows = shows;
    this.importIcon = faCheck;
    setTimeout(() => {
      this.importIcon = faArrowUp;
    }, 1000);
  }

	private getDismissReason(reason: any): string {
		switch (reason) {
			case ModalDismissReasons.ESC:
				return 'by pressing ESC';
			case ModalDismissReasons.BACKDROP_CLICK:
				return 'by clicking on a backdrop';
			default:
				return `with: ${reason}`;
		}
	}
}
