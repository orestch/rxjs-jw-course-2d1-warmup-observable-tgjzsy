import { Observable } from 'rxjs';

const observable$ = new Observable<string>((subscriber) => {
  console.log('Observable executed');
  subscriber.next('Alice');
  setTimeout(() => subscriber.next('Ben'), 2000);
  setTimeout(() => subscriber.next('Charlie'), 5000);
});

const observer = {
  next: (value) => console.log(`Observer 1: ${value}`),
};

const observer1 = {
  next: (value) => console.log(`Observer 2: ${value}`),
};

const subscription = observable$.subscribe(observer);
setTimeout(() => {
  const subscription1 = observable$.subscribe(observer1);
}, 2000);

setTimeout(() => {
  console.log('Ubsubscribe');
  subscription.unsubscribe();
}, 3000);
