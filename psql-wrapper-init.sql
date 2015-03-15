create table test_user (
	test_user_id bigserial primary key
	, test_user_name text not null
	, what text not null
);

insert into test_user (test_user_name, what)
values ('my user1', 'ok');

create table test_user_address (
	test_user_address_id bigserial primary key
	, address_info text not null
	, test_user_id bigint references test_user (test_user_id) not null
	, address_what text not null
);

insert into test_user_address (address_info, test_user_id, address_what)
values ('my address', 1, 'address ok');

grant all on all tables in schema public to test;
grant all on all sequences in schema public to test;
