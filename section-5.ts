import {
  Observable,
  of,
  from,
  interval,
  fromEvent,
  timer,
  forkJoin,
  combineLatest,
} from 'rxjs';
import { ajax } from 'rxjs/ajax';

of('Alice', 'Ben', 'Charlie').subscribe({
  next: (value) => console.log(value),
  complete: () => console.log('completed'),
});

const names$ = new Observable<string>((subscriber) => {
  subscriber.next('alice');
  subscriber.next('bob');
  subscriber.next('charlie');
  subscriber.complete();
});

names$.subscribe({
  next: (value) => console.log(value),
  complete: () => console.log('completed'),
});

function ourOwnOf(...args: string[]): Observable<string> {
  return new Observable<string>((subscriber) => {
    for (let i = 0; i < args.length; i++) {
      subscriber.next(args[i]);
    }
    subscriber.complete();
  });
}

ourOwnOf('Alice', 'Ben', 'Charlie').subscribe({
  next: (value) => console.log(value),
  complete: () => console.log('completed'),
});

from([1, 3, 5, 13]).subscribe({
  next: (value) => console.log('value: ', value),
  complete: () => console.log('completed'),
});

const promise = new Promise((resolve, reject) => {
  resolve('resolved');
});

const fromPromise$ = from(promise);

fromPromise$.subscribe({
  next: (value) => console.log('Promise value'),
  error: (error) => console.log('Error: ', error),
  complete: () => console.log('completed'),
});

const subscription = interval(1000).subscribe((value) => {
  console.log('Interval: ', value);
});

setTimeout(() => {
  subscription.unsubscribe();
  console.log('unsubscribe');
}, 5000);

/* From event - never complete, hot, producer is placed outside */
const triggerButton = document.querySelector('button#hello');

const fromEventSub = fromEvent(triggerButton, 'click').subscribe(
  (event: MouseEvent) => {
    console.log(event, event.type, event.x, event.y);
  }
);

setTimeout(() => {
  console.log('fromEvent unsubscribe');
  fromEventSub.unsubscribe();
}, 3000);

const triggerClick$ = new Observable<MouseEvent>((subscriber) => {
  const clickFn = (event: MouseEvent) => {
    subscriber.next(event);
  };

  triggerButton.addEventListener('click', clickFn);

  return () => {
    triggerButton.removeEventListener('click', clickFn);
  };
});

const triggerClickSub = triggerClick$.subscribe((event) => {
  console.log(event, event.type, event.x, event.y);
});

setTimeout(() => {
  console.log('fromEvent obs unsubscribe');
  triggerClickSub.unsubscribe();
}, 3000);

/* timer */
const timer$ = new Observable<number>((subscriber) => {
  const id = setTimeout(() => {
    subscriber.next(0);
    subscriber.complete();
  }, 2000);

  return () => {
    clearTimeout(id);
  };
});

const timerSub = timer$.subscribe({
  next: (value) => console.log(value),
  complete: () => console.log('Timer completed'),
});

setTimeout(() => {
  timerSub.unsubscribe();
}, 1000);

/* forkJoin */
const randomName$ = ajax('https://random-data-api.com/api/name/random_name');
const randomNation$ = ajax(
  'https://random-data-api.com/api/nation/random_nation'
);
const randomFood$ = ajax('https://random-data-api.com/api/food/random_food');

randomName$.subscribe((response: any) =>
  console.log('Response: ', response.response.first_name)
);
randomNation$.subscribe((response: any) =>
  console.log('Response: ', response.response.capital)
);
randomFood$.subscribe((response: any) =>
  console.log('Response: ', response.response.dish)
);

forkJoin([randomName$, randomNation$, randomFood$]).subscribe(
  ([nameResponse, nationResponse, foodResponse]: any[]) =>
    console.log(
      `${nameResponse.response.first_name} is from ${nationResponse.response.capital} and likes ${foodResponse.response.dish}`
    )
);

/* forkJoin error */
const a$ = new Observable((subscriber) => {
  setTimeout(() => {
    subscriber.next('A');
    subscriber.complete();
  }, 5000);

  return () => {
    console.log('A Teardown');
  };
});

const b$ = new Observable((subscriber) => {
  setTimeout(() => {
    subscriber.error('Failure');
  }, 3000);

  return () => {
    console.log('B Teardown');
  };
});

forkJoin([a$, b$]).subscribe({
  next: (value) => console.log(value),
  error: (err) => console.log('Error: ', err),
});

/* combineLatest */
const result = document.querySelector('#result');
const temperature = document.querySelector('#temperature');
const convertion = document.querySelector('#convertion');
type Unit = 'C' | 'F';

const temperature$ = fromEvent<InputEvent>(temperature, 'input');
const convertion$ = fromEvent<InputEvent>(convertion, 'input');
const convert = (temperature: number, targetUnit: Unit): string => {
  let result: number;

  switch (targetUnit) {
    case 'F':
      result = temperature * 1.8 + 32;
      break;
    case 'C':
      result = (temperature - 32) / 1.8;
      break;
    default:
      break;
  }

  return `Result: ${result}`;
};

combineLatest([temperature$, convertion$]).subscribe(
  ([temperature, convertion]) => {
    result.innerHTML = convert(
      Number(temperature.target['value']),
      convertion.target['value']
    );
  }
);
