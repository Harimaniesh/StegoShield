# Steganography Methodology & Technical Deep-Dive

StegoShield employs Least Significant Bit (LSB) steganography combined with AES-256-GCM authenticated symmetric encryption.

## 1. Cryptographic Payload Assembly

Before embedding bits into the cover image, the raw secret message or file undergoes AES-256-GCM encryption:

$$\text{Key} = \text{PBKDF2}(\text{password}, \text{salt}, \text{iterations}=100000)$$
$$\text{Ciphertext}, \text{Tag} = \text{AES-256-GCM}_{\text{Key}}(\text{Plaintext}, \text{Nonce})$$

### Binary Header Layout (`STGO`)
The encrypted payload is packaged into a binary header structure:

| Offset (Bytes) | Field Name | Size | Description |
| :--- | :--- | :--- | :--- |
| `0..3` | Magic Identifier | 4 B | `b"STGO"` magic header |
| `4` | Payload Type | 1 B | `0x01` (Text), `0x02` (File) |
| `5` | Extension Length | 1 B | Length of file extension string |
| `6..15` | File Extension | 10 B | Extension string (e.g. `".pdf"`) padded |
| `16..31` | Salt | 16 B | Cryptographic PBKDF2 random salt |
| `32..43` | Nonce / IV | 12 B | AES-256-GCM initialization vector |
| `44..47` | Ciphertext Length | 4 B | Unsigned big-endian integer length |
| `48..N` | Ciphertext | Var | AES-256-GCM encrypted payload |

---

## 2. Spatial LSB Bit Embedding Algorithm

1. The cover image is loaded and converted to RGB color channels (3 bytes per pixel).
2. The compiled binary payload is expanded into a sequence of binary bits $B = [b_0, b_1, \dots, b_n]$.
3. For each channel byte $P_i$ in the pixel array, the 0-th bit is replaced with $b_i$:

$$P_i' = (P_i \land \text{0xFE}) \lor b_i$$

4. The modified pixel array is exported exclusively to **lossless PNG format** to avoid JPEG lossy compression artifacts from corrupting LSB bits.
