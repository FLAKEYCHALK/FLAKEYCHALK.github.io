---
title: Slices in Rust 🦀
description: ferris is watching you how to slice!
publicationDate: 2023-07-30
---

## Overview

In Rust programming, a slice refers to a contiguous sequence of elements within a collection, like arrays or vectors. Slices enable borrowing a part of a collection without taking ownership, promoting efficient data manipulation. They can be created from arrays, vectors, strings, and other collections implementing the dereference trait in Rust.

## Code Example

In this code we have a variable called a and it holds an index of array containing `[1, 2, 3, 4, 5]` and below that is another variable called slice. Here I’ll talk about how can you only get the part you need on the array without taking the ownership, so first you need to reference the &a and specify what part of the index you need to slice, in this code we only need `[2, 3]` .

```rust
let a = [1, 2, 3, 4, 5];

let slice = &a[1..3];

assert_eq!(slice, &[2,3]);
```

The only thing that makes beginner confuse is how the counting starts. In `&a[1..3]`; the counting starts from 1 until 2, and the 3 exclude it because we are accessing `[2, 3]`.

About the `assert_eq!` it’s just to check you meet the slice in the variable `slice` you need to take, which is `[2, 3]`. The syntax for `assert_eq!` is shown below

```rust
assert_eq!(expected, actual);
```

There are some tips for using the slice

```rust
let slice = &x[..2];
// this is same here, since we are utilizing the short annotations here if you are using the first index
let slice = &x[0..2];
// if we can use it from the start of the index, then certainly we also have it for the last index
let slice = &x[0..];
// if you all want the entire index
let slice = &x[..];
```

And... That's it really... My quick opinion on how did I learn it!
