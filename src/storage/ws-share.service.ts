import { Injectable } from '@angular/core';
import { webSocketRegisterUrl, webSocketShareUrl } from '../config/configs';
import { ShowShare } from '../interfaces/show';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WsShareService {
  public wsShare!: WebSocket;
  public wsRegister!: WebSocket;

  public shareReceived = new Subject<ShowShare>();

  constructor() {
  }

  connectRegister(url: string): WebSocket {
    let wsShare = new WebSocket(url);
    wsShare.onmessage = (message) => {
      // Check if incoming message is of type ShowShare
      try {
        const share = JSON.parse(message.data) as ShowShare;
        this.shareReceived.next(share);
      } catch (error) {
        console.error('Incoming message is not a ShowShare:', message.data);
      }
    };
    return wsShare;
  }

  connectShare(url: string): WebSocket {
    let wsRegister = new WebSocket(url);
    return wsRegister;
  }

  sendShows(share: ShowShare) {
    if (this.wsShare && this.wsShare.readyState === WebSocket.OPEN) {
      this.wsShare.send(JSON.stringify(share));
      this.disconnect(this.wsShare);
    } else {
      this.wsShare = this.connectRegister(webSocketShareUrl);
      this.wsShare.onopen = () => {
        this.sendShows(share);
      };
    }
  }

  registerShare(shareId: string) {
    const payload = { shareId: shareId };
    if (this.wsRegister && this.wsRegister.readyState === WebSocket.OPEN) {
      this.wsRegister.send(JSON.stringify(payload));
    } else {
      this.wsRegister = this.connectRegister(webSocketRegisterUrl);
      this.wsRegister.onopen = () => {
        this.registerShare(shareId);
      };
    }
  }

  disconnect(socket: WebSocket): void {
    if (socket) {
      socket.close();
    }
  }
}
