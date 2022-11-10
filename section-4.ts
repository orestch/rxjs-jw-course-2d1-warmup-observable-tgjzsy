import { Observable } from 'rxjs';
import { ajax } from 'rxjs/ajax';

const cold$ = ajax('https://random-data-api.com/api/name/random_name');

cold$.subscribe((data: any) => {
  console.log(data.response?.first_name);
});

cold$.subscribe((data: any) => {
  console.log(data.response?.first_name);
});

cold$.subscribe((data: any) => {
  console.log(data.response?.first_name);
});

const helloButton = document.querySelector('button#hello');

const hot$ = new Observable<MouseEvent>((subscriber) => {
  helloButton.addEventListener('click', (event: MouseEvent) => {
    console.log('test');
    subscriber.next(event);
  });
});

hot$.subscribe((event) => {
  console.log('Sub1: ', event.type, event.x, event.y);
});

setTimeout(() => {
  console.log('Subscription 2 starts');
  hot$.subscribe((event) => {
    console.log('Sub1: ', event.type, event.x, event.y);
  });
}, 5000);
