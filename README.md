# Symmetric and asymmetric cryptography with OpenSSL

OpenSSL is an open source project aimed at providing a robust, commercial-grade, and full-featured toolkit for the Transport Layer Security (TLS) and Secure Sockets Layer (SSL) protocols. However, it has also turned out to be a widely-used, general-purpose cryptographic library, which is available for most Unix-like operating systems (including Linux, macOS, and BSD) and Microsoft Windows.

The core library, written in the C programming language, implements basic cryptographic functions (such as symmetric encryption, public-key encryption, digital signature, hash functions and so on) and provides various utility functions. Wrappers allowing the use of the OpenSSL library in a variety of computer languages are available.

The OpenSSL toolkit is licensed under an Apache-style licence, which basically means that you are free to get and use it for commercial and non-commercial purposes subjected to some simple licence conditions.

This tutorial shows some basics functionalities of the OpenSSL command line tool, and how to use it for symmetric and asymmetric cryptography.

> Although the tutorial is written using the Kali Linux distribution (and thus showing the standard Kali Linux prompt), it can be followed using any operating system with a working version of OpenSSL.

Let's start with the basics. You should be able to check the OpenSSL version you have installed with:

```console
kali@kali:~$ openssl version
OpenSSL 1.1.1g  21 Apr 2020
kali@kali:~$
```

The OpenSSL command-line tool is a suite that provides several commands addressing different functionalities. Here is the way to list them:

```console
kali@kali:~$ openssl list -commands
asn1parse         ca                ciphers           cms
crl               crl2pkcs7         dgst              dhparam
dsa               dsaparam          ec                ecparam
enc               engine            errstr            gendsa
genpkey           genrsa            help              list
nseq              ocsp              passwd            pkcs12
pkcs7             pkcs8             pkey              pkeyparam
pkeyutl           prime             rand              rehash
req               rsa               rsautl            s_client
s_server          s_time            sess_id           smime
speed             spkac             srp               storeutl
ts                verify            version           x509

kali@kali:~$

```

Let’s see a brief description of some of those commands:

- `ca` Certificate Authorities operations (certification, revocation, renewal).
- `dgst` Hash functions operations.
- `enc` Encryption/decryption using secret key algorithms.
- `genrsa` Key generation (public and private) for the RSA algorithm.
- `pkcs12` Tools to manage information according to the PKCS #12 standard.
- `rand` Generation of pseudo-random bit strings.
- `rsa` RSA data management.
- `rsautl` To encrypt/decrypt or sign/verify signatures with RSA.
- `verify` Checkings for X509.
- `x509` Data managing for X509.

In OpenSSL every command operates as an independent tool and therefore has different options and parameters. You can invoke the help of a specific command in two ways: either opening the man page of the command with `man openssl-<commandName>` or by explicitly calling the help of the command with `openssl <commandName> -help`; for instance, for the `ca` command it would be either `man openssl-ca` or `openssl ca -help`.

## 1. Symmetric or secret-key cryptography

OpenSSL implements a bunch of symmetric crypto algorithms. To get a list of available ciphers:

```console
kali@kali:~$ openssl list -cipher-commands
aes-128-cbc       aes-128-ecb       aes-192-cbc       aes-192-ecb
aes-256-cbc       aes-256-ecb       aria-128-cbc      aria-128-cfb
aria-128-cfb1     aria-128-cfb8     aria-128-ctr      aria-128-ecb
aria-128-ofb      aria-192-cbc      aria-192-cfb      aria-192-cfb1
aria-192-cfb8     aria-192-ctr      aria-192-ecb      aria-192-ofb
aria-256-cbc      aria-256-cfb      aria-256-cfb1     aria-256-cfb8
aria-256-ctr      aria-256-ecb      aria-256-ofb      base64
bf                bf-cbc            bf-cfb            bf-ecb
bf-ofb            camellia-128-cbc  camellia-128-ecb  camellia-192-cbc  
camellia-192-ecb  camellia-256-cbc  camellia-256-ecb  cast
cast-cbc          cast5-cbc         cast5-cfb         cast5-ecb
cast5-ofb         des               des-cbc           des-cfb
des-ecb           des-ede           des-ede-cbc       des-ede-cfb
des-ede-ofb       des-ede3          des-ede3-cbc      des-ede3-cfb
des-ede3-ofb      des-ofb           des3              desx
rc2               rc2-40-cbc        rc2-64-cbc        rc2-cbc
rc2-cfb           rc2-ecb           rc2-ofb           rc4
rc4-40            seed              seed-cbc          seed-cfb
seed-ecb          seed-ofb          sm4-cbc           sm4-cfb
sm4-ctr           sm4-ecb           sm4-ofb

kali@kali:~$
```

The output gives you a list of ciphers with its variations in key length and mode of operation. For example `aes-256-cbc` for AES with key size 256 bits in CBC-mode. Some ciphers also have short names, for example `des-cbc` is also known as `des`.

> For a complete list of cipher algorithms and aliases names execute `openssl list -cipher-algorithms`

### 1.1. Key generation

In symmetric cryptography we need a (pre-)shared secret between the peers. Although it is common to derive the secret from a shared password, ideally the shared secret would be a random sequence of bits. Although OpenSSL allows using a password, let us do things properly, and directly create key as random.

In the following example we are going to use AES-256-CBC, that is to say that we are going to work with blocks of 128 bits and with a key length of 256 bits (32 bytes). The random key can be created using the `openssl rand` command as:

```console
kali@kali:~$ openssl rand -hex 32
bd57a0bd79e42af44c570dc73da4c328dc236b9c4320d9c985e0ec796cc6b55c
kali@kali:~$
```

The `-hex` option forces the output to be in hex.

> Notice that, depending on the encryption algorithm, [some keys are weak](https://en.wikipedia.org/wiki/Weak_key). For example, the key `e0e0e0e0f1f1f1f1` is one of 16 weak keys when using the DES algorithm.

Let us assume in the following that we share this secret with Alice, to whom we want to securely send a message.

### 1.2. Encrypt and decrypt

Let us first create the message to be sent. Just create a text file with the content you want; for instance:

```console
kali@kali:~$ echo "This is a plaintext message" > plaintext
kali@kali:~$ cat plaintext
This is a plaintext message
kali@kali:~$
```

Encryption and decryption in OpenSSL hare handled by the `enc` command. Its basic usage is to specify a cipher and various options describing the actual task. You can easily invoke the help of the `enc` command with:

```console
kali@kali:~$ openssl enc -help
Usage: enc [options]
Valid options are:
 -help               Display this summary
 -list               List ciphers
 -ciphers            Alias for -list
 -in infile          Input file
 -out outfile        Output file
 -pass val           Passphrase source
 -e                  Encrypt
 -d                  Decrypt
 -p                  Print the iv/key
 -P                  Print the iv/key and exit
 -v                  Verbose output
 -nopad              Disable standard block padding
 -salt               Use salt in the KDF (default)
 -nosalt             Do not use salt in the KDF
 -debug              Print debug info
 -a                  Base64 encode/decode, depending on encryption flag
 -base64             Same as option -a
 -A                  Used with -[base64|a] to specify base64 buffer as a single line
 -bufsize val        Buffer size
 -k val              Passphrase
 -kfile infile       Read passphrase from file
 -K val              Raw key, in hex
 -S val              Salt, in hex
 -iv val             IV in hex
 -md val             Use specified digest to create a key from the passphrase
 -iter +int          Specify the iteration count and force use of PBKDF2
 -pbkdf2             Use password-based key derivation function 2
 -none               Don't encrypt
 -*                  Any supported cipher
 -rand val           Load the file(s) into the random number generator
 -writerand outfile  Write random data to the specified file
 -engine val         Use engine, possibly a hardware device
kali@kali:~$
```

The list of options is rather long but lets us detail more the ones we are going to use more.

- `-in filename` This specifies the input file.
- `-out filename` This specifies the output file. It will be created or overwritten if it already exists.
- `-e` or `-d` This specifies whether to encrypt (`-e`) or to decrypt (`-d`). Encryption is the default.
- `-a | -base64`, `-A` These flags tell OpenSSL to apply Base64-encoding before or after the cryptographic operation. The `-a` and `-base64` are equivalent. By default, the encoded file has a line break every 64 characters. To suppress this you can use in addition to `-base64|-a` the `-A` flag. This will produce a file with no line breaks at all.
  > It is key to understand [Base64](https://en.wikipedia.org/wiki/Base64) encoding in order to follow this and subsequent tutorials. If you are not familiar with it, please study it before proceeding.
- `-iv` This specifies the initialization vector IV (in hex). If not explicitly given, it will be derived from the password using a key derivation function (kdf).
- `-K` This option allows you to set the key (in hex) used for encryption or decryption. This is the key directly used by the cipher algorithm. If no key is provided, the user will be prompted to enter a password, and OpenSSL will derive a key from the password using a key derivation function (kdf).

#### 1.2.1. Encryption

Let us now encrypt the `plaintext` file using the shared secret that we have with Alice.

As you already know (or should already know), every time we encrypt something, we should use a different IV value. The IV is implemented using a nonce, and we are going to generate nonces as the output of a pseudo-random function, which is a common approach. Since AES-CBC uses blocks of 128 bits, we need IV of 128 bits (16 bytes), so we can generate an IV as:

```console
kali@kali:~$ openssl rand -hex 16
53c73e819cbd75b985c68b8620e96cc0
kali@kali:~$
```

Now we can encrypt the `plaintext` input file using AES-256-CBC with (replace `bd57a0bd79e42af44c570dc73da4c328dc236b9c4320d9c985e0ec796cc6b55c` and `53c73e819cbd75b985c68b8620e96cc0` with the key and IV that you got in the previous commands):

```console
kali@kali:~$ openssl enc -aes-256-cbc -in plaintext -out ciphertext -K bd57a0bd79e42af44c570dc73da4c328dc236b9c4320d9c985e0ec796cc6b55c -iv 53c73e819cbd75b985c68b8620e96cc0
kali@kali:~$
```

The `plaintext` input file is always treated as a binary input (stream of bytes), no matter it is a text file or not, so the command will be the same for a non-text file.

Since by default we are not using Base64 encoding, the `ciphertext` output file is binary and therefore it is unlikely to be properly opened with a text editor. You can just easily check this fact by trying to show the contents of the `ciphertext` file as text.

```console
kali@kali:~$ cat ciphertext
�tS41OW
       ����=�;�Q(�n
;       �7>�kali@kali:~$
```

> For Alice to be able to decrypt the file, she will need not only the `ciphertext` file but also the IV that was used to encrypt that file. Opposite to the shared key, the IV should change with every message and therefore be sent in clear to the receiver. As a consequence, an encrypted message will be a tuple `(ciphertext, IV)`

We could also get the output as text using Base64 encoding (`-a` option). Since we are going to encrypt again, we also need to generate a new IV.

```console
kali@kali:~$ openssl rand -hex 16
e90210f9df5bdf5bfbf1c246c825781f
kali@kali:~$ openssl enc -aes-256-cbc -in plaintext -out ciphertextBase64 -K bd57a0bd79e42af44c570dc73da4c328dc236b9c4320d9c985e0ec796cc6b55c -iv e90210f9df5bdf5bfbf1c246c825781f -a
kali@kali:~$ cat ciphertextBase64
Vrv13yy/hqXFmWaibzB3UWVKlRMGtiPuOTqlxgPE3eQ=
kali@kali:~$
```

#### 1.2.2. Decryption

Let us assume that Alice has received the tuples:

- `(ciphertext, 53c73e819cbd75b985c68b8620e96cc0)`,
- and `(ciphertextBase64, e90210f9df5bdf5bfbf1c246c825781f)`

She can decrypt both of them as:

```console
kali@kali:~$ openssl enc -aes-256-cbc -d -in ciphertext -out decryotedFile1 -K bd57a0bd79e42af44c570dc73da4c328dc236b9c4320d9c985e0ec796cc6b55c -iv 53c73e819cbd75b985c68b8620e96cc0
kali@kali:~$ cat decryotedFile1
This is a plaintext message
kali@kali:~$ openssl enc -aes-256-cbc -d -in ciphertextBase64 -out decryotedFile2 -K bd57a0bd79e42af44c570dc73da4c328dc236b9c4320d9c985e0ec796cc6b55c -iv e90210f9df5bdf5bfbf1c246c825781f -a
kali@kali:~$ cat decryotedFile2
This is a plaintext message
kali@kali:~$
```

Note the `-d` option that puts the `openssl enc` command in decryption mode. Note also the `-a` in the second decryption command, which informs that the `ciphertextBase64` input file is encoded in Base64.

## 2. Asymmetric or public-key cryptography

To illustrate how OpenSSL manages public key algorithms we are going to use the widely used and known RSA algorithm. Other algorithms exist of course, but the principle remains the same.

In this tutorial we will assume that there are two peers, namely Alice and Bob, we will create key pairs for both of them, `(pubA,privA)` and `(pubB,privB)` respectively, and we will practice encryption/decryption and signing/verification.

### 2.1. Key generation

OpenSSL command line tools for RSA key generation hare handled by the `openssl genrsa` command. Main usage and options of this command are (there are more):

Usage: `openssl genrsa [options]`

Options:

- `-help` Display this summary
- `-3 | -F4 | -f4` The public exponent to use, either 65537 (`-F4` or `-f4`) or 3 (`-3`). The default is 65537.
- `-out filename` Output the key pair to the specified file. If this argument is not specified, then standard output is used.
- `aes128 | -aes192 | -aes256 | -aria128 | -aria192 | -aria256 | -camellia128 | -camellia192 | -camellia256 | -des | -des3 | -idea` Encrypt the private key with specified cipher before outputting it. If none of these ciphers is specified, no encryption is used. If encryption is used a pass phrase is prompted if it is not supplied via the `-passout` argument.
- `numbits` The length in bits of the private key to generate. This must be the last option specified. The default is 2048 and values less than 512 are not allowed.

Let us create a pair of public/private keys for Alice and Bob alike. We will use a key size of 3072 bit, that is roughly equivalent in strength to a 128-bit symmetric key.

```console
kali@kali:~$ openssl genrsa -out privA.pem 3072
Generating RSA private key, 3072 bit long modulus (2 primes)
........................................................................++++
.........................................................................................++++
e is 65537 (0x010001)
kali@kali:~$ openssl genrsa -out privB.pem 3072
Generating RSA private key, 3072 bit long modulus (2 primes)
.......................................................................................................................................................................++++
................................................................++++
e is 65537 (0x010001)
kali@kali:~$
```

RSA key pair generation essentially involves the generation of two prime numbers. When generating a private key, various symbols are output to indicate the progress of the generation. A `.` represents each number which has passed an initial sieve test, `+` means a number has passed a single round of the Miller-Rabin primality test. A newline means that the number has passed all the prime tests (the actual number depends on the key size). Because key generation is a random process, the time taken to generate a key may vary somewhat.

> By default, the generated file is stored in a text file using [PEM](https://en.wikipedia.org/wiki/Privacy-Enhanced_Mail), which is mainly a Base64 encoding of the [DER](https://en.wikipedia.org/wiki/X.690#DER_encoding)-serialized ASN.1 data structure. If you are not familiar with PEM and DER, please study them before continuing.

Let us focus on Alice's private key `privA.pem`. It uses PEM (so does also Bob's one), so it is a text file, and we can easily check its contents:

```console
kali@kali:~$ cat privA.pem
-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----
kali@kali:~$
```

From the output we can see that the file stores an RSA private key. Since we also need the complementary public key, you may ask yourself where the public key is. Do not worry, it is common practice that the private key object also holds the public key. In fact, you can output a human-readable view of the stored private key that will also show the public exponent with the `openssl rsa` command.

```console
kali@kali:~$ openssl rsa -in privA.pem -text -noout
RSA Private-Key: (3072 bit, 2 primes)
modulus:
    00:b7:22:5b:e5:00:00:16:79:76:ec:d0:96:74:55:
    c7:a1:91:e7:1a:ce:40:5e:ef:01:c0:3c:34:32:89:
    f0:00:05:39:e2:c4:21:7c:48:f4:e1:14:9c:45:bd:
    d2:9c:a3:0b:4f:1e:0a:2b:e2:05:30:03:80:a5:5d:
    6e:6c:76:ca:98:e3:a1:70:ae:d7:5d:5c:4c:03:12:
    42:8f:85:9c:cc:04:b9:3b:41:16:e0:1e:92:81:92:
    98:bc:f7:34:0b:a5:52:ec:8a:ed:94:4d:f0:5f:29:
    57:4c:32:1d:37:54:6e:de:2b:ca:e1:2f:8f:43:70:
    4b:60:63:24:b3:90:1b:fb:85:20:22:a0:74:63:f5:
    68:30:29:4a:b6:65:86:5a:0d:34:c7:e8:91:03:a3:
    13:59:22:ba:dc:90:9a:6b:05:53:98:fc:b1:11:99:
    10:00:23:48:a9:cc:3f:f0:6e:11:53:85:cf:0c:6e:
    0e:eb:a5:e4:ad:d4:fb:d9:94:be:9a:0b:0f:82:a0:
    db:40:b8:7d:97:ac:59:81:6e:1d:dc:1e:90:4b:79:
    2f:87:94:2f:99:a4:93:cb:7c:75:05:2a:3f:ff:e2:
    16:8a:0d:a4:56:7c:0e:3f:58:8f:94:8f:d1:bc:06:
    02:d0:7d:a7:f9:95:59:7d:3f:53:48:7e:3b:3b:53:
    a2:3f:01:81:d0:5b:78:4e:c8:e8:65:f7:83:d9:35:
    33:7a:e7:97:7d:8d:24:10:c5:32:d0:11:04:29:18:
    ce:20:25:ce:71:68:84:d3:e9:f6:ad:b9:f8:b2:04:
    40:37:bd:bb:0f:6a:c9:e2:c6:26:60:56:cc:ee:51:
    c7:ce:c5:36:df:89:fa:0f:88:e6:3d:b7:ae:9d:3a:
    c0:7b:cb:7c:c7:ac:6f:3b:f0:14:75:c5:94:02:9a:
    0c:7d:3d:b5:c9:7a:7e:5a:e3:88:c8:f3:bb:5c:e7:
    6e:62:8c:6d:27:26:5e:a7:52:90:7d:38:cc:e5:df:
    27:c2:b9:88:3a:cf:3c:c0:0d:0b
publicExponent: 65537 (0x10001)
privateExponent:
    00:b2:1c:dc:bb:70:b0:a5:2b:25:9b:55:93:bf:39:
    de:9b:29:c8:57:ad:d9:b5:7b:47:7c:ac:11:28:46:
    38:02:0d:13:2b:96:0d:eb:4f:19:bb:ff:cb:ad:98:
    dd:4a:32:d9:40:ed:ba:7e:cb:a8:b7:f5:f0:1c:e5:
    2e:0c:97:cc:9b:be:68:b9:ab:93:12:de:3d:9f:8f:
    16:e5:77:d1:f4:2b:73:ec:49:75:f2:2c:49:d9:73:
    b6:d1:b2:ac:0f:d7:8f:3b:38:33:b1:55:cc:3f:01:
    7a:42:45:4b:5d:10:e5:73:77:ac:2e:2f:8f:6a:cb:
    c0:c3:d2:29:53:eb:09:0c:2b:82:01:ab:85:07:e3:
    1a:9e:1c:ca:e9:72:fc:a4:80:cb:a0:d2:74:97:d0:
    f7:74:6d:ee:c7:ae:6c:41:42:40:f8:3e:6c:08:ed:
    91:3e:51:12:ce:f2:34:0d:a7:3f:7a:b8:5d:93:7d:
    47:4d:b1:5f:24:22:4d:80:64:c6:ac:13:ac:30:f5:
    7b:79:13:d2:80:23:02:4b:3c:c7:01:d8:77:4f:f2:
    01:2b:4e:3c:37:d5:2e:ae:20:8a:28:36:17:d8:c0:
    d0:ce:31:e7:cc:94:fd:23:da:cf:40:a8:79:d6:48:
    a1:2d:d9:c2:13:7a:da:3f:10:8c:5f:64:9a:04:28:
    9b:88:cb:8f:2e:05:91:03:b8:b6:23:85:01:61:5a:
    bb:73:b6:cc:8b:d4:6c:72:8b:47:1e:29:a7:16:33:
    b5:f6:7c:81:9f:a1:0c:cd:2b:bb:53:8c:1c:df:0b:
    62:12:6e:48:05:74:fc:63:48:3f:18:5c:11:92:64:
    f7:72:87:bf:bd:6d:58:d6:d6:17:d6:b8:a6:e4:eb:
    37:26:2a:fb:a2:02:ec:94:cc:e5:42:91:fc:19:56:
    29:4e:97:c5:18:39:f9:e6:40:e6:25:e6:18:cd:07:
    27:b9:4d:70:e4:be:3e:49:d8:ee:d1:bd:0e:00:26:
    5a:c0:20:d0:59:76:a5:8d:e2:21
prime1:
    00:d9:66:e0:7f:0c:d9:28:74:54:9f:49:24:41:7e:
    da:9d:a0:7b:7e:5f:4f:11:96:5a:e1:62:26:80:65:
    ef:64:7a:8e:18:ae:4e:17:c7:78:0a:83:b8:ee:cc:
    a1:c2:58:23:c2:99:d0:90:38:87:16:1b:69:80:2c:
    7e:19:1c:cb:32:56:32:47:f3:fa:f9:05:43:4f:2c:
    b5:95:bc:f6:29:37:eb:c4:0b:75:71:85:32:66:65:
    3d:90:c5:ce:3f:50:1f:01:e6:6a:ba:53:dc:90:60:
    44:d8:97:00:11:aa:88:ee:35:d9:4a:7c:02:79:d7:
    6b:b3:11:2f:75:fe:f9:88:ad:87:b9:5f:71:d8:37:
    6b:64:80:a9:d9:69:b8:67:e5:2b:89:57:ba:83:6d:
    0e:55:6f:13:3e:87:8e:20:58:9c:3a:30:93:c0:e8:
    a0:2e:38:b2:e6:45:2e:ea:4c:46:f6:e3:fb:3a:09:
    78:31:29:7f:46:4e:81:0f:fa:ed:11:86:6f
prime2:
    00:d7:a5:fc:0c:2a:fe:4d:bf:b2:50:a1:05:a0:58:
    60:10:cd:a1:3b:fd:c2:52:09:db:c9:71:f9:45:f7:
    7b:85:a2:21:ff:a6:cd:a1:ca:f5:70:18:ab:6b:03:
    4b:3a:1b:68:0c:83:3d:c6:43:a8:20:a2:7a:46:13:
    03:ac:55:34:62:0f:48:f0:91:85:2b:70:ff:68:32:
    c6:c8:a2:5c:02:8e:45:23:29:f6:f3:b8:e6:f1:8c:
    44:4a:4c:d0:50:f5:d8:f6:b8:03:e7:a7:41:f9:b8:
    4b:0a:fc:b1:5e:93:39:e3:e9:ec:77:0c:4b:a4:b6:
    b3:69:55:58:12:58:f4:5d:bb:91:67:f3:51:ee:e7:
    bf:9f:eb:f4:68:e4:4e:63:07:83:dd:08:9b:6e:4a:
    d7:04:81:71:3b:c0:4f:36:9f:74:fa:b9:c0:4b:42:
    6c:92:8f:7b:7e:e4:6a:b6:b1:c1:ac:e6:96:81:3a:
    bc:ff:2b:b1:ae:72:72:bf:4a:e0:79:d1:25
exponent1:
    00:83:52:a5:a1:99:7d:43:f6:a1:77:66:93:44:0d:
    00:b9:de:cb:3a:57:10:48:2b:6e:d2:5e:9b:ab:4b:
    e8:03:e6:14:17:cc:92:d7:c2:62:3c:d7:bc:ca:63:
    4a:03:3f:82:ba:76:77:89:e6:db:92:fb:14:0b:9c:
    d4:bf:0e:a9:9f:ca:79:ad:05:30:41:64:70:78:4f:
    25:91:42:07:e0:76:2b:30:cd:4b:30:3b:a9:6a:39:
    15:ab:72:11:58:25:69:d5:97:fe:38:77:97:f0:8e:
    76:87:ef:0e:d7:9d:10:01:f4:fd:41:05:0f:e9:d1:
    ba:f8:fc:14:93:4e:66:25:ad:cd:22:a9:08:f7:f6:
    e2:24:5f:a4:39:f4:a6:b3:fb:b7:04:cb:bd:9a:ce:
    31:ae:61:de:5a:13:40:43:41:c3:7d:53:02:ad:b0:
    d7:b1:94:06:5d:1a:c5:70:3a:8b:53:6f:fb:bd:df:
    22:7f:6f:f5:b5:de:8e:0f:bd:1f:9f:4a:79
exponent2:
    00:85:e3:c6:93:ff:75:98:ec:36:58:1d:41:93:06:
    8b:ce:a2:fd:42:74:11:5c:42:46:b5:d2:0f:c4:c3:
    1d:6c:20:f8:1e:f4:7f:a3:be:91:98:a1:98:7c:7e:
    b5:0c:44:cb:db:48:f8:e7:ca:45:ee:cd:32:41:a3:
    b8:9a:1c:e4:c3:25:5e:52:0e:e7:b1:cb:1c:a8:a3:
    2e:0c:8f:d1:b4:bc:84:6c:8a:b7:8b:26:f8:2c:6c:
    bc:51:ad:53:81:90:c2:be:9c:0d:c0:9c:76:38:07:
    96:80:21:d8:36:32:0e:b5:55:1d:bd:e4:62:6a:c8:
    0c:a8:8f:96:78:fd:c5:eb:14:73:f9:28:77:6c:6f:
    72:e8:65:e5:7f:e2:90:50:a7:ef:d5:22:6c:ee:93:
    84:e0:85:45:ba:a5:72:09:26:03:c9:4f:de:f6:5b:
    2d:71:e9:a7:f1:66:fc:62:a6:06:eb:c4:d7:19:31:
    50:fa:d5:34:22:6d:68:95:20:76:32:ec:09
coefficient:
    6d:bf:da:7b:e0:85:4a:11:b8:44:2a:89:33:a3:8d:
    d0:7f:3f:da:5a:3b:d5:18:56:e7:de:ad:09:6b:10:
    0c:dc:a7:c7:87:44:f1:a6:0d:3d:04:59:6c:04:bf:
    f5:a8:46:1c:70:2f:4a:91:37:1d:0b:81:d3:ca:a8:
    ca:6b:0d:65:80:5e:d4:f7:38:5e:ad:e4:3c:db:ae:
    d4:d9:85:c9:a3:81:8b:52:7d:57:ac:da:43:cb:eb:
    0b:92:b1:b2:76:f1:42:41:c1:c6:7d:60:94:6a:5e:
    cd:97:a8:d4:c7:ac:15:cc:ff:51:1e:49:b2:74:0e:
    49:7f:0c:92:dd:49:06:8a:bd:a0:c6:eb:ef:78:78:
    38:1e:8a:ef:82:c6:9e:5d:3c:d3:1f:0f:7e:8e:70:
    60:82:51:13:cf:c3:7f:7f:4d:f6:d1:d6:a2:e1:c6:
    ca:64:98:89:1b:d7:2d:46:e9:75:b6:db:f9:0e:cd:
    cd:b8:1e:88:60:d1:7b:62:71:00:6f:be
kali@kali:~$  
```

> Note that besides the private key $(d,n)$=`(privateExponent, modulus)` and the public key $(e,n)$=`(publicExponent, modulus)`, there are more parameters stored that would not be necessary, namely: `prime1`, `prime2`, `exponent1`, `exponent2`, and `coefficient`. It has to do with optimizing RSA decryption. It turns out that, instead of running the modular exponentiation $c^{d} \mod n$, decryption can be run faster [using the Chinese Remainder Theorem](https://en.wikipedia.org/wiki/RSA_(cryptosystem)#Using_the_Chinese_remainder_algorithm) with precomputed values of $p$=`prime1`, $q$=`prime2`, $e^{-1} \mod (p−1)$=`exponent1`, $e^{-1} \mod (q−1)$=`exponent2`, and $q^{-1} \mod p$=`coefficient`.

If Alice needs to share her public key, she can extract it from her private one. For example, she could store it to file `pubkey.pem` as:

```console
kali@kali:~$ openssl rsa -in privA.pem -pubout -out pubA.pem
writing RSA key
kali@kali:~$
```

Bob could also do the same as:

```console
kali@kali:~$ openssl rsa -in privB.pem -pubout -out pubB.pem
writing RSA key
kali@kali:~$
```

> Since the private key must be kept always secret, it is likely that you prefer to store it protected with a password. Basically, the private key will be encrypted with a key that is derived using a key derivation function from a password you provide.
>
> The following terminal snippet shows how you can protect your key using AES-256-CBC. During the process you will be asked to provide a password. For security reasons, nothing is shown on the screen when you type it (not even a `*` or a `●`), so just type in and press enter when you are done.
>
> ```console
> kali@kali:~$ openssl rsa -in privA.pem -aes256 -out protectedPrivA.pem
> writing RSA key
> Enter PEM pass phrase:
> Verifying - Enter PEM pass phrase:
> kali@kali:~$
> ```
>
> You could also have created and protected the private key with AES-256-CBC in just one step from the very beginning by just adding `-aes256` to the `openssl genrsa` command.

### 2.2. Encrypt, decrypt, sign and verify

In public-key cryptography, on the one hand, we encrypt data with the destination's public key so that just the destination (who is the only having the private key) can decrypt the data. On the other hand, we sign data with the source's private key (that is actually “encrypting” with the source's private key) so that anyone can verify the signature with the source's public key.

The OpenSSL command `rsautl` handles the four operations: encrypt (with public key), decrypt (with private key), sign (with private key), verify (with public key). Main usage and options of this command are (there are more):

Usage: `openssl rsautl [options]`

Options:

- `-in file` The input file to read data from or standard input if this option is not specified.
- `-out file` The output file to write to or standard output by default.
- `-inkey file` Input file with an RSA private key pair (default), a certificate (if also `-certin` is provided) or a public key (if `-pubin` is also passed).
- `-pubin | -certin` Indicates that the `-inkey` file is either an RSA public key (`-pubin`) or a certificate containing an RSA public key (`-certin`). If it is not set, the `-inkey` file is assumed to be a private key.
- `-oaep | -pkcs | -raw | -ssl | -x931` Use PKCS#1 OAEP padding (`-oaep`), PKCS#1 v1.5 padding (`-pkcs` default), no padding (`-raw`), SSL v2 padding (`-ssl`), or ANSI X9.31 padding (`-x931`)
- `-encrypt | -decrypt | -sign | -verify` Encrypt with public key, decrypt with private key, sign with private key or verify with public key.

#### 2.2.1. Encrypt, decrypt

Let us suppose that we are Alice, so that we have a key pair `privA.pem`, `pubA.pem`, and we also have Bob's public key `pubB.pem` and/or Bob's certificate `certB.pem`.

Let us take the previously created `plaintext` file and encrypt it for Bob. The encrypted file will be stored in the binary file `encryptedFile`.

```console
kali@kali:~$ openssl rsautl -encrypt -in plaintext -out encryptedfile -inkey pubB.pem -pubin
kali@kali:~$
```

> If you had Bob's certificate `certB.pem` instead of his public key, you could tell `openssl rsautl` to use the public key that is in the certificate with just:
>
> ```console
> kali@kali:~$ openssl rsautl -encrypt -in plaintext -out encryptedfile -inkey certB.pem -certin
> kali@kali:~$
> ```

Notice that, in the RSA cryptosystem, the maximum input bitlength is the RSA modulus bitlength (3072 bits or 384 bytes in our tutorial); less indeed since a few bits are used for special purposes, such as padding. Since the `openssl rsautl` command provides pure RSA functionalities, it does not split a large message into blocks or something similar, and therefore it cannot be used to encrypt a piece of data larger than the modulus. You can easily test this by trying to encrypt any file larger than the modulus length. For instance, if you try to encrypt the `ls` executable file, which is present in any Linux/Unix system:

```console
kali@kali:~$ openssl rsautl -encrypt -in /usr/bin/ls -out encryptedfile -inkey pubB.pem -pubin
RSA operation error
140427009848576:error:0406D06E:rsa routines:RSA_padding_add_PKCS1_type_2:data too large for key size:../crypto/rsa/rsa_pk1.c:124:
kali@kali:~$
```

Now Alice can send `encryptedFile` to Bob, and once Bob receives it, he can decrypt it to a file `decryptedFile` using his private key:

```console
kali@kali:~$ openssl rsautl -decrypt -in encryptedfile -out decryptedFile -inkey privB.pem
kali@kali:~$
```

#### 2.2.2. Sign, verify

Let us now make Alice sign a plaintext message that will be verified by Bob.

```console
kali@kali:~$ openssl rsautl -sign -in plaintext -out signedfile -inkey privA.pem
kali@kali:~$
```

The signed message will get Bob that will verify that it was actually signed by Alice using Alice's public key `pubA.pem`.

```console
kali@kali:~$ openssl rsautl -verify -in signedfile -out verifiedfile -inkey pubA.pem -pubin
kali@kali:~$ cat verifiedfile
This is a plaintext message
kali@kali:~$
```

As it happened before when encrypting, if we had tried to sign a file greater than the RSA modulus, it would have failed. You can easily check by trying to sign any file bigger than 3Kbit, for instance the `/bin/ls` executable file.

```console
kali@kali:~$ openssl rsautl -sign -in /bin/ls -out signedfile -inkey privA.pem
RSA operation error
139643820963072:error:0406C06E:rsa routines:RSA_padding_add_PKCS1_type_1:data too large for key size:../crypto/rsa/rsa_pk1.c:25:
kali@kali:~$
```

Raw RSA signing is not an option since we would not be able to sign arbitrary size messages. We could split the input message into blocks and sign every block, but that would be overkilling. Indeed, the most accepted approach, which is the main idea behind the so-called *digital signatures*, is to sign a cryptographically secure digest (which will be always smaller than the maximum input size) of the document instead of the document itself. The signed digest is precisely the digital signature of the document. The overall process is pictured in the following figure.

![Digital Signature](./DigitalSignature.png)

## 3. Exercises

- Create your own pair of RSA public and private keys with 4096 bits.
- Select one of your classmates to exchange your public keys by email.
- Download from the Internet an image larger than 4096 bits (512 bytes).
- Encrypt that image for the selected classmate and send it to her/him.
  - You should know at this point that, since the image is larger than the RSA modulus, you can not directly encrypt it with plain RSA. However, you should be able design a potential solution. Do it. Write down the commands you need to execute, the files that you send to your classmate and the commands she/he must run to finally recover the image.
- Take the same image and try to sign it.
  - Once again you can't because the image is too large. A potential solution is creating a digital signature as explained in section 2.2.2; just try to implement it. The key for success is on the `openssl dgst` command.
  - When you have created the signature, send it along with the original image to your classmate. She/He should be able to verify that the signature is valid for the received image.
