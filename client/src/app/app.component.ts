import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Buffer } from 'buffer';
@Component({
  selector: 'app-root',
  // imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'client';

  send() {
    console.log('sending!!');

    let ss = 'send this to my extension!!';

    // TODO: send ss as message to extension
  }
}
