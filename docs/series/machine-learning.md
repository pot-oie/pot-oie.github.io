# Machine Learning Series Progress

Purpose: this document is an in-context index of Pot's published machine-learning learning series. It is optimized for future Codex retrieval and for quickly aligning another conversation with what has already been written.

Scope:

- Source: `src/content/blog/*.mdx`
- Included: posts with `series.key: "machine-learning"` and `draft: false`
- Excluded: draft posts such as `gen-05-*`, `gnn-02-*`, `ssl-*`, and non-ML series such as LeetCode / data-structure notes
- Last updated: 2026-06-20

## Current Route

The published learning path currently runs:

1. Machine Learning basics
2. Deep Learning basics
3. CNN
4. GNN intro
5. RNN
6. Generative models
7. Transformer and ViT
8. LLM models and LoRA
9. Diffusion, Latent Diffusion, and DiT

The main line is already enough to support later paper-style notes around modern LLMs and image-generation systems. Semi-supervised learning, GNN history, and decoding strategies remain draft / advanced follow-up material.

## Machine Learning Basics

### `ml-01-introduction.mdx` - Machine Learning 01: Overview

Learned:

- Machine learning is framed as a function-learning process: the machine learns a mapping from input to output rather than receiving handcrafted rules.
- Clarified how output form determines task type: scalar regression, categorical classification, structured output, and generation.
- Established the basic supervised-learning vocabulary: data, labels, model, parameters, training, loss, and prediction.
- Introduced different learning setups at a high level: supervised, unsupervised, semi-supervised, reinforcement-style framing.
- Connected early ML framing to later large-model work: LLMs still optimize prediction objectives, but at a much larger scale and with richer data.

### `ml-02-linear-regression.mdx` - Machine Learning 02: Linear Regression

Learned:

- Linear regression as the first concrete model: fitting a line / plane to explain numerical targets.
- Parameters are adjustable coefficients that determine the model's current hypothesis.
- Loss functions quantify how wrong the model is; MSE gives a smooth penalty for regression.
- Training is iterative parameter adjustment rather than a one-shot formula in the learning narrative.
- Gradient descent is introduced through the linear-regression setting as "move parameters in the direction that reduces loss."
- The article establishes the core loop reused later: forward prediction -> loss -> gradient -> update.

### `ml-03-gradient-descent.mdx` - Machine Learning 03: Gradient Descent

Learned:

- Gradient descent is an optimization procedure for following local slope information toward lower loss.
- The learning rate controls step size; too large overshoots, too small crawls.
- Distinguished full-batch, mini-batch, and stochastic gradient descent by how much data is used to estimate each gradient.
- Mini-batch training is positioned as the practical compromise between stability and computational efficiency.
- Prepared later optimizer articles by separating "what gradient says" from "how optimizer decides to move."

### `ml-04-bias-variance-cross-validation.mdx` - Machine Learning 04: Generalization

Learned:

- Generalization is the central issue behind train/test mismatch.
- Bias and variance explain two different failure modes: underfitting from overly simple assumptions, overfitting from excessive sensitivity.
- Underfitting and overfitting are introduced as model-capacity and data-fit problems.
- Regularization is introduced as an explicit way to control complexity.
- Cross-validation is used to estimate whether the model will hold up beyond the training set.
- This article becomes the conceptual base for later "Test Bad" and deep-learning regularization notes.

### `ml-05-classification.mdx` - Machine Learning 05: Classification

Learned:

- Classification is different from regression because the output is a class decision rather than a continuous value.
- The model must produce a score or probability-like value that can be converted into categories.
- Classification loss differs from regression loss; the model should be punished for assigning low probability to the correct class.
- Introduced the split between generative classification and discriminative classification.
- Set up the next two articles: probabilistic generative models and direct boundary-learning models.

### `ml-06-probabilistic-generative-model.mdx` - Machine Learning 06: Probabilistic Generative Model

Learned:

- Generative classification models learn class-conditional distributions and use Bayes' rule for prediction.
- The model asks: "If this sample came from class C, how likely would its features be?"
- Covered prior probability, likelihood, posterior probability, and their roles in classification.
- Showed why assumptions about distributions matter, including Gaussian-style modeling intuition.
- Established a "model the data-generation process first, classify second" perspective.

### `ml-07-discriminative-model.mdx` - Machine Learning 07: Discriminative Model

Learned:

- Discriminative models learn the classification boundary directly instead of modeling how each class generated data.
- Logistic regression is treated as direct probability estimation for binary classification.
- Cross entropy is introduced as the natural loss for probability-based classification.
- The article contrasts "learn P(x|y)" vs. "learn P(y|x)".
- This becomes the bridge from classical classification to neural-network classifiers.

### `ml-08-bayes-to-sigmoid.mdx` - Machine Learning 08: Sigmoid

Learned:

- Sigmoid is explained as a function that compresses arbitrary real-valued scores into `(0, 1)`.
- It connects linear scoring to probability-like classification output.
- The article traces how Bayesian/log-odds reasoning leads naturally to a linear score passed through sigmoid.
- Clarified why logistic regression can be viewed as a linear decision boundary wrapped in a probability transform.
- Prepares the jump from logistic units to neurons.

### `ml-09-classification-to-neural-network.mdx` - Machine Learning 09: Multiclass and Neural Network

Learned:

- Multiclass classification generalizes binary classification to multiple competing class scores.
- Linear classifiers fail on linearly inseparable problems, motivating learned feature transformations.
- Feature transformation is introduced as the conceptual move from raw input space to a more useful representation space.
- Neural networks are framed as automated feature transformers stacked before a classifier.
- This article closes the classical ML route and opens the deep-learning route.

## Deep Learning Basics

### `dl-01-perceptron-to-mlp.mdx` - Deep Learning 01: MLP

Learned:

- Perceptron as the simplest neuron-like classifier.
- MLP as a stack of layers that composes simple transformations into more expressive functions.
- Input, hidden, and output layers are introduced as the basic network anatomy.
- Activation functions are needed to introduce nonlinearity; otherwise stacked linear layers collapse into one linear layer.
- Deep-learning frameworks are positioned as tools that automate tensor operations, gradients, and updates.

### `dl-02-depth-and-feature-reuse.mdx` - Deep Learning 02: Deep Networks

Learned:

- Universal approximation alone does not explain why depth is useful.
- "Wide but shallow" networks can represent functions but may be inefficient and difficult to train.
- Deep networks reuse intermediate features, building complex concepts from simpler reusable parts.
- Depth gives hierarchical representation learning: early features support later abstractions.
- Complex tasks benefit from staged composition rather than direct memorization.

### `dl-03-why-deep-learning-became-possible.mdx` - Deep Learning 03: History

Learned:

- Early deep learning suffered from training instability, insufficient compute, and weak optimization.
- Boltzmann Machine and RBM are introduced as historical attempts at unsupervised representation learning.
- Layer-wise pretraining helped make deeper models trainable before modern optimization/hardware matured.
- The deep-learning boom depended on data, GPU compute, ReLU-like activations, better initialization, normalization, and optimization.
- This article provides historical context for why old ideas became practical later.

### `dl-04-backpropagation.mdx` - Deep Learning 04: Backpropagation

Learned:

- Naive gradient computation in deep networks is too expensive without reuse.
- Chain rule is the mathematical core of backpropagation.
- Forward pass caches intermediate values; backward pass reuses them to compute gradients efficiently.
- Backpropagation is dynamic programming over a computation graph.
- Gradient vanishing appears when repeated multiplication shrinks signals through depth.

### `dl-05-backpropagation-math.mdx` - Deep Learning 05: Backprop Math

Learned:

- Detailed single-neuron gradient derivation.
- Error signal is introduced as the local responsibility passed backward.
- Two-layer network derivation shows how gradients flow through weights, activations, and loss.
- Parameter gradients are decomposed into upstream error times local input.
- Recursive formulas explain how backprop generalizes to arbitrary depth.
- Computation graph view ties the derivation to implementation.

### `dl-06-vanishing-gradient-activation.mdx` - Deep Learning 06: Activation Functions

Learned:

- Activation functions strongly affect gradient flow.
- Sigmoid-like saturation can create vanishing gradients.
- ReLU reduces saturation on the positive side and became a key practical improvement.
- Leaky ReLU and PReLU address dead-ReLU behavior by preserving a small negative slope.
- Maxout is introduced as a flexible activation family.
- This article frames activation choice as a Train Bad fix.

### `dl-07-optimizer-chronicle.mdx` - Deep Learning 07: Optimizers

Learned:

- Train Bad can come from optimization difficulty, not only model capacity.
- SGD is the baseline optimizer: simple, noisy, and data-efficient.
- Momentum accumulates historical direction to reduce zigzagging.
- RMSProp adapts step size per parameter using recent squared gradients.
- Adam combines momentum-like first moment and RMSProp-like second moment.
- This article establishes why optimizers encode assumptions about gradient history.

### `dl-08-adam-adamw.mdx` - Deep Learning 08: AdamW

Learned:

- Adam is decomposed into first moment, second moment, bias correction, and adaptive update.
- Adam's fast convergence can come with generalization issues and sharp-minima behavior.
- SWATS is introduced as an attempt to transition between Adam and SGD behavior.
- AdamW separates weight decay from Adam's adaptive gradient update.
- Decoupled weight decay is explained as a cleaner form of regularization for adaptive optimizers.

### `dl-09-generalization.mdx` - Deep Learning 09: Generalization

Learned:

- Test Bad is the deep-learning version of overfitting/generalization failure.
- Early stopping monitors validation behavior and stops when continued training starts memorizing.
- L2 regularization discourages extreme weights and smoother solutions.
- Dropout randomly disables neurons during training to break co-adaptation.
- Dropout is also interpreted as implicit ensemble training over many subnetworks.

### `dl-10-training-stability-tricks.mdx` - Deep Learning 10: Training Tricks

Learned:

- Training stability tricks are grouped into randomness, schedule/difficulty control, and scale control.
- Shuffling avoids biased mini-batches caused by ordered data.
- Gradient noise can help escape local traps early and fade later.
- Warmup prevents unstable large updates at the beginning of training.
- Curriculum learning introduces easier examples before harder ones.
- Fine-tuning reuses pretrained models but can cause catastrophic forgetting if updates are too aggressive.
- Normalization is expanded with a table intuition: BatchNorm normalizes feature columns across a batch; LayerNorm normalizes a sample/token's feature row.
- BatchNorm: uses batch statistics, common in CNNs, batch-size sensitive, has different train/inference statistics.
- LayerNorm: uses per-sample/per-token hidden features, independent of batch, common in Transformer/LLM.
- Shape mapping introduced: MLP `[B, D]`, CNN `[B, C, H, W]`, Transformer `[B, T, D]`.
- InstanceNorm, GroupNorm, and RMSNorm are briefly positioned as normalization variants.

### `dl-11-from-fnn-to-network-architecture.mdx` - Deep Learning 11: Structure Design

Learned:

- Fully connected networks ignore useful structure in data.
- Architecture is framed as inductive bias: the model design encodes assumptions about the task.
- Moving beyond FNN means selecting structures that match image grids, sequences, graphs, or tokens.
- This article prepares the transition into CNN, RNN, GNN, and Transformer.

## CNN Basics

### `cnn-01-local-patterns.mdx` - CNN 01: CNN

Learned:

- Images have local spatial structure, channels, translation patterns, and hierarchical features.
- CNNs exploit locality through convolution kernels instead of full dense connections.
- Convolution shares weights over spatial positions, reducing parameters and encoding translation-related assumptions.
- Pooling reduces spatial size and adds local invariance, but may hurt precise localization.
- Flattening plus FNN connects convolutional features to final classification.

### `cnn-02-feature-visualization.mdx` - CNN 02: Feature Visualization

Learned:

- Early CNN layers learn low-level features such as edges, colors, and simple textures.
- Deeper layers learn more abstract object parts and semantic patterns.
- Feature visualization helps inspect what filters or activations respond to.
- Fully connected layers combine extracted features into task decisions.
- Output layers translate internal features into class probabilities/scores.
- Visualization is used as a bridge from discriminative CNNs toward generative visual manipulation.

### `cnn-03-deep-dream-style-transfer.mdx` - CNN 03: Style Transfer

Learned:

- Deep Dream amplifies patterns that CNN layers already recognize.
- Different CNN layers correspond to different levels of visual abstraction.
- Style transfer separates content representation and style representation.
- Gram Matrix captures feature correlations used as a style signal.
- Early CNN-based generation was powerful but limited: it manipulated existing images rather than learning full data distributions.

### `cnn-04-beyond-images.mdx` - CNN 04: Cross-Modal Convolution

Learned:

- Convolution is not limited to natural images; it applies wherever local structure exists.
- Go/board states can be treated as spatial grids where local patterns matter.
- Speech can be represented as spectrogram-like 2D patterns suitable for convolution.
- Text can use 1D convolution to capture local n-gram-like patterns.
- The article broadens CNN as a local-pattern operator, not merely an image model.

### `cnn-05-resnet.mdx` - CNN 05: ResNet

Learned:

- Very deep networks can suffer degradation: deeper models train worse even without classic overfitting.
- Residual blocks learn `F(x) + x`, making it easier to preserve useful identity mappings.
- Residual connections improve backward gradient flow.
- Basic and Bottleneck residual blocks represent two engineering tradeoffs.
- ResNet and Highway Network are compared as two skip-connection philosophies.
- ResNet becomes a broader architectural pattern reused beyond CNNs, including Transformer-style residual design.

### `cnn-06-unet.mdx` - CNN 06: U-Net

Learned:

- U-Net targets dense pixel-level prediction rather than single-label classification.
- Encoder compresses spatial information into semantic features; decoder restores resolution.
- Skip connections reconnect high-resolution local detail to upsampled semantic maps.
- U-Net resolves the tension between semantic abstraction and precise localization.
- Decoder/upsampling design introduces issues such as checkerboard artifacts and motivates later stable image-generation backbones.
- U-Net becomes the main denoiser backbone in many diffusion models before DiT.

## GNN Basics

### `gnn-01-message-passing.mdx` - GNN 01: Message Passing

Learned:

- Graph data is needed when relationships are irregular rather than grid-like.
- GNNs generalize neural computation to nodes and edges.
- Message passing updates node representations by collecting information from neighbors.
- Aggregation function choice matters because neighbor sets are unordered.
- Spatial-domain and spectral/frequency-domain GNN views are briefly introduced.
- GNN tasks include node classification, graph classification, and link prediction.
- CNN and GNN are related: CNN is a special case of local aggregation on regular grids.
- Note: this published post still intentionally contains two `toconnect` placeholders for deeper GNN follow-ups.

## RNN Basics

### `rnn-01-memory.mdx` - RNN 01: RNN

Learned:

- FNNs treat inputs as independent slots and cannot naturally remember previous sequence elements.
- Text must be encoded numerically before entering models.
- RNN introduces hidden state as memory passed across time.
- Elman and Jordan networks show two historical memory-loop variants.
- Bidirectional RNN reads sequence context in both directions when future context is available.
- The article establishes why sequence models need internal state.

### `rnn-02-bptt-gradient.mdx` - RNN 02: BPTT

Learned:

- RNN training can be viewed by unrolling the network through time.
- Sequence loss can be accumulated over many time steps.
- BPTT applies backpropagation over the unrolled temporal computation graph.
- RNN error surfaces can be difficult because recurrent weights are repeatedly reused.
- Compared RNN temporal depth with deep FNN layer depth.
- Gradient clipping is introduced to control exploding gradients.
- LSTM and GRU are introduced as responses to long-range gradient/memory problems.

### `rnn-03-sequence-tasks.mdx` - RNN 03: Sequence Tasks

Learned:

- Many-to-one tasks map a sequence to one output, such as sentiment classification.
- Many-to-many tasks produce aligned sequence outputs.
- Long-to-short tasks compress long sequences into shorter representations.
- Seq2Seq uses encoder-decoder structure for variable-length input/output conversion.
- Attention is introduced as the mechanism that lets the decoder read relevant encoder states instead of relying on one fixed context vector.
- Jay Alammar's seq2seq/attention article is used as a detailed external reference rather than duplicating all mechanics.

### `rnn-04-lstm.mdx` - RNN 04: LSTM

Learned:

- LSTM separates cell state and hidden state.
- Gates control forgetting, writing, and output exposure.
- Additive memory update helps preserve long-range information better than repeated vanilla multiplication.
- Worked example explains memory update intuition.
- Parameter cost increases because gates add multiple learned projections.
- Vectorized layer implementation connects single-cell diagrams to real batched computation.
- Peephole connections, stacked LSTM, and GRU are introduced as variants.

## Generative Model Basics

### `gen-01-early-generative-models.mdx` - Generative Models 01: Early Models

Learned:

- PixelRNN models images autoregressively, one pixel at a time.
- VAE introduces latent-variable generation through encoder/decoder and continuous latent space.
- GAN reframes generation as a game between generator and discriminator.
- VAE tends toward blurry averages; GAN can be sharp but unstable and mode-collapse prone.
- Diffusion is introduced as a later response to instability and quality tradeoffs.

### `gen-02-autoregressive-generation.mdx` - Generative Models 02: Autoregressive Generation

Learned:

- Autoregressive generation factorizes a sequence probability into next-step conditional probabilities.
- RNN-era generation predicts the next element from previous context.
- Conditional generation adds an external condition `C`, such as source sentence, image, or prompt.
- Encoder-decoder architecture is introduced as the RNN-era solution for conditional sequence generation.
- HRED extends Seq2Seq to multi-turn dialogue with utterance-level and session-level recurrent structure.
- This article connects old sequence generation to later GPT-style next-token prediction.

### `gen-03-attention-extensions.mdx` - Generative Models 03: Attention

Learned:

- Attention lets a decoder dynamically read encoder states at each generation step.
- Attention weights are interpreted as a moving focus over memory.
- Jay Alammar's visual NMT article is linked as the visual reference.
- Memory Network extends attention over external stored sentences/facts and supports multi-hop retrieval.
- Neural Turing Machine introduces differentiable read/write memory.
- Pointer Network uses attention weights to select/copy input elements directly.
- Recursive Network is introduced as a tree-structured alternative to chain sequence models.

### `gen-04-decoding-training-tricks.mdx` - Generative Models 04: Advanced Tuning

Learned:

- Bad attention can repeatedly focus on the wrong place; coverage penalty can regularize attention distribution.
- Teacher forcing stabilizes training by feeding ground-truth previous tokens.
- Exposure bias appears because inference must condition on the model's own previous outputs.
- Scheduled sampling gradually mixes model-generated tokens into training context.
- Greedy decoding chooses the top token at every step and can get stuck in local decisions.
- Beam Search keeps multiple candidate prefixes to reduce one-step myopia.
- Object-level optimization recognizes that token-level loss does not directly optimize sentence-level metrics such as BLEU/ROUGE.
- Reinforcement-learning framing for sentence-level reward is connected to the later RLHF idea.
- Temperature/Top-k/Top-p are intentionally deferred to `gen-05`, which remains draft.

## Transformer Basics

### `transformer-01-self-attention.mdx` - Transformer 01: Self-Attention

Learned:

- RNN sequential dependency is slow; CNN local receptive fields struggle with long-range dependency.
- Self-Attention gives direct pairwise communication between all tokens in one layer.
- Q/K/V split gives learnable roles: query, key, and value.
- Scaled dot-product attention computes similarity, normalizes with softmax, then mixes values.
- Matrix parallelism is key to Transformer hardware efficiency.
- Multi-head attention allows different relation subspaces to be modeled in parallel.
- Positional encoding is needed because attention alone is order-insensitive.

### `transformer-02-architecture.mdx` - Transformer 02: Architecture

Learned:

- Original Transformer is an Encoder-Decoder Seq2Seq architecture.
- Encoder block combines Multi-Head Self-Attention and position-wise FFN.
- Add & Norm uses residual connections and LayerNorm for trainability.
- Decoder uses causal mask to prevent future-token leakage.
- Cross-Attention lets decoder queries read encoder key/value outputs.
- Transformer family branches are introduced: Encoder-only BERT, Decoder-only GPT, Encoder-Decoder T5.
- This article links back to `dl-10` for the BN/LN normalization comparison.

### `transformer-03-vit.mdx` - Transformer 03: ViT

Learned:

- ViT converts images into token sequences by splitting them into patches.
- Patch count is `N = H * W / P^2`; patch size controls sequence length and compute.
- Patch embedding maps flattened image patches into Transformer hidden dimension.
- Patch embedding can be implemented as `Conv2D(kernel=P, stride=P)`.
- Position encoding injects spatial location after images become a sequence.
- Class Token is borrowed from BERT and aggregates global image information for classification.
- ViT uses standard Transformer Encoder blocks with LN, MSA, MLP, and residual connections.
- ViT weakens CNN visual inductive bias, requiring more data but scaling better with large pretraining.
- ViT establishes the tokenization bridge that makes DiT conceptually natural.

## LLM Basics

### `llm-01-gpt2.mdx` - LLM 01: GPT-2

Learned:

- GPT-2 uses Decoder-only Transformer for autoregressive language modeling.
- Causal Mask ensures each token only attends to itself and past tokens.
- Next-token prediction with negative log-likelihood is the core pretraining objective.
- Scale effect is introduced through parameters, data, and larger WebText-style training.
- Zero-shot and multitask behavior emerge from prompting natural-language task descriptions.
- GPT-2 is framed as "Transformer decoder stack + language modeling head + scale."

### `llm-02-bert.mdx` - LLM 02: BERT

Learned:

- BERT uses Encoder-only Transformer for bidirectional language understanding.
- Full self-attention sees both left and right context.
- Masked Language Modeling prevents trivial self-copy while enabling bidirectional pretraining.
- NSP is introduced as an original sentence-pair pretraining task, with later caveat that it is not always necessary.
- Fine-tuning paradigm: one pretrained encoder plus small task-specific heads.
- BERT is contrasted with GPT: understanding-side encoder vs. generation-side decoder.

### `llm-03-gpt3.mdx` - LLM 03: GPT-3

Learned:

- GPT-3 largely continues GPT-2's Decoder-only architecture rather than inventing a new block.
- Scaling parameters, data, and compute is the central story.
- Approximate compute relation `C ~= 6PD` is introduced.
- Prompting modes are defined: zero-shot, one-shot, few-shot.
- In-context learning is explained as task adaptation through activations/context rather than weight updates.
- GPT-3 limitations are noted: autoregressive constraints, context length limits, statistical plausibility vs. truth.

### `llm-04-lora.mdx` - LLM 04: LoRA

Learned:

- Full fine-tuning is expensive because trainable parameters require gradients and optimizer states.
- LoRA assumes downstream updates have low intrinsic rank.
- Original weight `W0` is frozen; low-rank matrices `A` and `B` learn update `Delta W`.
- Forward equation uses `W0 x + (alpha/r) B A x`.
- Initialization uses random `A`, zero `B` so the model starts equivalent to the base model.
- Common insertion points are Transformer attention projection matrices, especially `Wq` and `Wv`.
- LoRA weights can be merged into base weights for zero extra inference latency.

## Diffusion Basics

### `diffusion-01-overview.mdx` - Diffusion 01: DDPM

Learned:

- DDPM is the concrete diffusion foundation article.
- Forward process gradually adds Gaussian noise to clean data.
- Reverse process learns to denoise from noisy samples back toward data.
- The model can predict the reverse mean but is commonly trained to predict noise.
- Noise-prediction objective becomes a practical MSE training target.
- The article positions DDPM as the core diffusion paper rather than looking for one generic "diffusion paper."

### `diffusion-02-sampling-acceleration.mdx` - Diffusion 02: Sampling Acceleration

Learned:

- Diffusion sampling is slow because naive DDPM requires many iterative denoising steps.
- DDIM gives a deterministic/non-Markovian sampling path that can use fewer steps.
- Noise prediction connects to score matching: predicting the data distribution's log-density gradient.
- SDE and ODE views unify stochastic and deterministic generation paths.
- DPM-Solver uses ODE solver ideas / exponential integrator intuition for faster sampling.
- This article provides the acceleration bridge between DDPM and practical image generation.

### `diffusion-03-latent-diffusion.mdx` - Diffusion 03: Latent Diffusion

Learned:

- Pixel-space diffusion is expensive at high resolution.
- Latent Diffusion first compresses images with a VAE and performs diffusion in latent space.
- This reduces compute while keeping perceptual structure.
- Stable Diffusion combines VAE latent space, U-Net denoiser, and text conditioning.
- Cross-Attention injects text information into image denoising.
- Classifier-Free Guidance controls the tradeoff between prompt adherence and sample diversity.
- The article sets up the denoiser replacement question later answered by DiT.

### `diffusion-04-dit.mdx` - Diffusion 04: DiT

Learned:

- DiT replaces U-Net denoiser with Transformer denoiser.
- U-Net bottlenecks: engineering complexity, feature-map alignment, convolution/skip memory cost, weaker scaling uniformity.
- DiT uses latent patch tokens, not raw pixel patches; it inherits the ViT tokenization idea after VAE compression.
- Dynamic denoising requires timestep `t` and condition `c` to be injected into every block.
- Compared conditioning strategies: in-context token concatenation, Cross-Attention, and adaptive LayerNorm.
- adaLN maps condition/time to dynamic LayerNorm scale/shift parameters.
- adaLN-Zero initializes modulation/gating so early training starts as identity mapping.
- DiT Block is essentially a Transformer block over latent patches.
- Scaling law: depth, width, and patch size control Gflops; more compute generally improves generation quality.
- DiT is positioned as an upgrade inside the Latent Diffusion framework, not a rejection of diffusion math.

## Draft / Follow-Up Material Not Included

These files exist or are planned but are not part of this published-progress index because they are `draft: true` or still local/unpublished:

- `gen-05-decoding-strategies.mdx`: decoding strategies, Temperature, Top-k, Top-p, penalties.
- `gnn-02-history.mdx`: GNN development history and aggregation variants.
- `ssl-01-overview.mdx` through `ssl-04-graph-smoothness.mdx`: semi-supervised learning.
- `learning-draft*.mdx`: raw planning / source notes.

Known published loose end:

- `gnn-01-message-passing.mdx` still contains two intentional `toconnect` placeholders for deeper GNN follow-ups.

## Retrieval Notes

When future work asks where to place a topic:

- Put CNN-specific visual inductive bias, convolution, ResNet, U-Net under CNN.
- Put tokenization, Self-Attention, Transformer blocks, LayerNorm references, ViT under Transformer.
- Put GPT-2, BERT, GPT-3, LoRA under LLM.
- Put DDPM, DDIM, SDE/ODE, DPM-Solver, Latent Diffusion, Stable Diffusion, DiT under Diffusion.
- Put Temperature / Top-k / Top-p in `gen-05`, not GPT-specific articles.
- Put semi-supervised learning after the current main route, because it is intentionally advanced/follow-up.
