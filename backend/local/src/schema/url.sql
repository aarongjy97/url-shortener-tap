create table URL (
    shortenedURL varchar(100) not null,
    originalURL varchar(255) not null,
    expiryDate timestamp not null,
    primary key (shortenedURL)
);