# Feature flags service

Let's talk about feature flags. Feature flags are a way to enable or disable a feature in your application. They are used to testing new features, to roll out new features to a subset of users, or to disable a feature in case of an emergency.

<!--@include: ../shared/case.md-->

## The problem

Let's say you have a new feature that you want to test — **dynamic favicon that changes after some activity in the application**. It's a cool feature, but you don't want to release it to all users at once. You want to test it first, do some math calculating profit increase, and then release it to a subset of users.
