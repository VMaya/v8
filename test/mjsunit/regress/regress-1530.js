// Copyright 2011 the V8 project authors. All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above
//       copyright notice, this list of conditions and the following
//       disclaimer in the documentation and/or other materials provided
//       with the distribution.
//     * Neither the name of Google Inc. nor the names of its
//       contributors may be used to endorse or promote products derived
//       from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// Test that redefining the 'prototype' property of a function object
// does actually set the internal value and does not screw up any
// shadowing between said property and the internal value.

var f = function() {};

// Verify that normal assignment of 'prototype' property works properly
// and updates the internal value.
var x = { foo: 'bar' };
f.prototype = x;
assertSame(f.prototype, x);
assertSame(f.prototype.foo, 'bar');
assertSame(new f().foo, 'bar');
assertSame(Object.getPrototypeOf(new f()), x);
assertSame(Object.getOwnPropertyDescriptor(f, 'prototype').value, x);

// Verify that 'prototype' behaves like a data property when it comes to
// redefining with Object.defineProperty() and the internal value gets
// updated.
var y = { foo: 'baz' };
Object.defineProperty(f, 'prototype', { value: y, writable: true });
assertSame(f.prototype, y);
assertSame(f.prototype.foo, 'baz');
assertSame(new f().foo, 'baz');
assertSame(Object.getPrototypeOf(new f()), y);
assertSame(Object.getOwnPropertyDescriptor(f, 'prototype').value, y);

// Verify that the previous redefinition didn't screw up callbacks and
// the internal value still gets updated.
var z = { foo: 'other' };
f.prototype = z;
assertSame(f.prototype, z);
assertSame(f.prototype.foo, 'other');
assertSame(new f().foo, 'other');
assertSame(Object.getPrototypeOf(new f()), z);
assertSame(Object.getOwnPropertyDescriptor(f, 'prototype').value, z);

// Verify that 'name' is (initially) non-writable, but configurable.
var fname = f.name;
f.name = z;
assertSame(fname, f.name);
Object.defineProperty(f, 'name', {value: 'other'});
assertSame('other', f.name);

// Verify same for 'length', another configurable and non-writable property.
assertEquals(0, Object.getOwnPropertyDescriptor(f, 'length').value);
assertDoesNotThrow(function () { Object.defineProperty(f, 'length', {writable: true}); });
f.length = 3;
assertEquals(3, Object.getOwnPropertyDescriptor(f, 'length').value);
f.length = "untyped";
assertSame("untyped", Object.getOwnPropertyDescriptor(f, 'length').value);

// Verify that non-writability of other properties is respected.
assertThrows("Object.defineProperty(f, 'caller', { value: {} })");
assertThrows("Object.defineProperty(f, 'arguments', { value: {} })");
