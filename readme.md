# GDS TAP Url Shortener 

## Link to website
Access to it [here](https://main.d27bkgr4ng1o2a.amplifyapp.com/).  
<code>https://main.d27bkgr4ng1o2a.amplifyapp.com/</code>

## Intent
I want to submit any URL link so it can be shortened, to be used or shared.

## Assumptions
1. Using the same input link, there is no requirement on generating a different link as the output.
2. Each link will have an expiry date, which should be (?) cleaned up by the backend.
3. Users can also create their custom URLs.

## Technical Stack

### Cloud
1. AWS Amplify to host the web application
2. AWS Lambda to host the backend logic
3. MongoDB Atlas hosted on AWS for data persistance
4. React for the web application
5. Typescript for the entire stack

### Local
1. Express to host the API routes and backend logic
2. PostgresSQL for data persistance
3. React for the web application
4. Typescript for the entire stack

### Schema
```sql 
create table URL (
    shortenedURL varchar(100) not null,
    originalURL varchar(255) not null,
    expiryDate timestamp not null,
    primary key (shortenedURL)
);
```
- Based on Assumption 1, each URL should be identified by their own hash, but if the user keys in the same link, it will return the same shortened URL.

### Hashing Logic  

```typescript
export function generateShortenedURL(url: string): string {
  return enc.Base64.stringify(SHA256('')).substring(0, 8);
}
```

Here, we are using <code>SHA256</code> as the hash function.
Subsequently, we would encode the hash into Base64.
However, for our shortened URL, we will use the first 8 of the sequence.  
As a result, there will be 64^8 permutations of our shortened URL.


```typescript
export async function deconflictURL(check: URLSchema, url: string): Promise<string> {
  let concatedURL = url;
  let deconflictShortURL = "";

  while (check && check.originalurl !== url) {
    concatedURL += url;
    deconflictShortURL = generateShortenedURL(concatedURL);
    check = await searchExistingURL(deconflictShortURL);
  }

  if (!check) {
    await saveURL(deconflictShortURL, url);
  }

  return deconflictShortURL;
}
```

Should there be any collisions within the 64^8 permutations, we will concantenate the URL with itself until a hash is found.

