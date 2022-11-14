import {
  EMPTY,
  forkJoin,
  fromEvent,
  NEVER,
  Observable,
  of,
  interval,
} from 'rxjs';
import { ajax } from 'rxjs/ajax';
import {
  filter,
  map,
  tap,
  debounceTime,
  catchError,
  concatMap,
  takeUntil,
  takeWhile,
} from 'rxjs/operators';

/* Section 6 Operators */
/* filter */

interface NewsItem {
  category: 'Business' | 'Sports';
  content: string;
}

const news$ = new Observable<NewsItem>((subscriber) => {
  setTimeout(() => {
    subscriber.next({ category: 'Business', content: 'A' });
  }, 1000);

  setTimeout(() => {
    subscriber.next({ category: 'Sports', content: 'B' });
  }, 3000);

  setTimeout(() => {
    subscriber.next({ category: 'Business', content: 'C' });
  }, 4000);

  setTimeout(() => {
    subscriber.next({ category: 'Sports', content: 'D' });
  }, 6000);

  setTimeout(() => {
    subscriber.next({ category: 'Business', content: 'E' });
  }, 7000);
});

const sportsNewsFeed$ = news$.pipe(
  filter((item: NewsItem) => item.category === 'Sports')
);

sportsNewsFeed$.subscribe((item) => {
  console.log(item);
});

/* map */
const randomFirstName$ = ajax(
  'https://random-data-api.com/api/name/random_name'
).pipe(map((ajaxResponse: any) => ajaxResponse.response.first_name));

const randomCapital$ = ajax(
  'https://random-data-api.com/api/nation/random_nation'
).pipe(map((ajaxResponse: any) => ajaxResponse.response.capital));

const randomDish$ = ajax(
  'https://random-data-api.com/api/food/random_food'
).pipe(map((ajaxResponse: any) => ajaxResponse.response.dish));

forkJoin([randomFirstName$, randomCapital$, randomDish$]).subscribe(
  ([name, capital, dish]: string[]) =>
    console.log(`${name} is from ${capital} and likes ${dish}`)
);

/* tap */
const numbers$ = of(1, 5, 5, 62, 6)
  .pipe(
    filter((value) => value > 5),
    tap((value) => console.log(value)),
    map((value) => value * 2)
  )
  .subscribe((item) => console.log('Value', item));

/* debounceTime */
const sliderInput = document.querySelector('input#slider');

fromEvent(sliderInput, 'input')
  .pipe(
    debounceTime(200),
    map((event) => event.target['value'])
  )
  .subscribe((value) => console.log(value));

/* catchError */
const failingHttpRequest$ = new Observable((subscriber) => {
  setTimeout(() => {
    subscriber.error(new Error('Timeout'));
  }, 3000);
}).pipe(catchError((error) => EMPTY));

console.log('App started');

failingHttpRequest$.subscribe({
  next: (value) => console.log(value),
  error: (error) => console.log('Error', error),
  complete: () => console.log('Completed'),
});

/* Flattening operators - examples */
const source$ = new Observable((subscriber) => {
  setTimeout(() => subscriber.next('A'), 2000);
  setTimeout(() => subscriber.next('B'), 5000);
});

console.log('App2 started');
source$
  .pipe(
    concatMap((value) => {
      console.log(value);
      return interval(1000).pipe(takeWhile((value) => value < 2));
    })
  )
  .subscribe((value) => console.log(value));

/* concatMap */
const endpointInput: HTMLInputElement = document.querySelector('#name');
const fetchButton = document.querySelector('#fetch-button');

fromEvent(fetchButton, 'click')
  .pipe(
    map(() => endpointInput.value),
    concatMap((value) =>
      ajax(`https://random-data-api.com/api/${value}/random_${value}`).pipe(
        catchError((error) => EMPTY)
      )
    ),
    map((response) => response.response)
  )
  .subscribe((value) => console.log(value));

/* concatMap - errorHandling */
fromEvent(fetchButton, 'click')
  .pipe(
    map(() => endpointInput.value),
    concatMap((value) =>
      ajax(`https://random-data-api.com/api/${value}/random_${value}`).pipe(
        catchError((error) => EMPTY)
      )
    ),
    map((response) => response.response)
  )
  .subscribe({
    next: (value) => console.log(`The random food ${value}`),
    error: (error) => console.log('Error: ', error),
    complete: () => console.log('completed test'),
  });
