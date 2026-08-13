# Forensic Steganalysis & Risk Assessment Methodology

StegoShield includes a multi-dimensional forensic steganalysis engine designed to detect statistical anomalies introduced by LSB image manipulation.

## 1. Shannon Entropy Analysis

Entropy measures the degree of randomness in byte distributions:

$$H(X) = -\sum_{i=1}^{n} P(x_i) \log_2 P(x_i)$$

- Natural uncompressed images generally exhibit entropy between **6.5 and 7.5 bits/byte** due to smooth gradients and correlated textures.
- High-density encrypted payloads (AES-256 ciphertext) approach maximum entropy (**~7.95+ bits/byte**), triggering an entropy anomaly indicator.

---

## 2. LSB Bit Balance & Pairwise Chi-Square Test

### LSB Ratio
In natural images, LSBs correlate with adjacent higher-order bits, so the ratio of 1s in LSBs varies. Overwriting LSBs with encrypted data drives the ratio of 1s to **~0.500 (50.0%)**.

$$\text{LSB Ratio} = \frac{1}{N} \sum_{i=1}^{N} (P_i \land 1)$$

### Chi-Square Sample Pairing Analysis
Natural pixel pair frequencies $(2k, 2k+1)$ differ due to image structures. LSB replacement smooths out these pair frequencies. StegoShield calculates the Chi-Square statistic across adjacent pixel pairs:

$$\chi^2 = \sum_{i=0}^{127} \frac{(y_{2i} - e_i)^2}{e_i} + \frac{(y_{2i+1} - e_i)^2}{e_i}$$

where $e_i = \frac{y_{2i} + y_{2i+1}}{2}$.

A low $\chi^2$ statistic indicates artificial LSB pair frequency smoothing typical of sequential LSB embedding.

---

## 3. High-Frequency Laplacian Noise Estimation

High-frequency noise variance is measured using a 2D Laplacian operator:

$$\text{Var}(\Delta I) = \text{Var} \left( \frac{\partial^2 I}{\partial x^2} + \frac{\partial^2 I}{\partial y^2} \right)$$

Higher noise levels combined with LSB randomness contribute to elevated risk scores (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
