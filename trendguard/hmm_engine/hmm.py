import numpy as np
from scipy.stats import multivariate_normal

class HiddenMarkovModel:
    """
    Gaussian HMM for continuous 3D observations:
    [Velocity, Fatigue, Retention]
    """
    def __init__(self, states, emission_means, emission_covs, transition_matrix=None, initial_probs=None):
        self.states = states
        self.n_states = len(states)
        self.state_to_idx = {s: i for i, s in enumerate(states)}
        
        # Transition Matrix (Default: Flow from Growth -> Saturation -> Decline)
        self.A = transition_matrix if transition_matrix is not None else np.array([
            [0.8, 0.2, 0.0],  # Growth -> Growth/Sat
            [0.0, 0.7, 0.3],  # Saturation -> Sat/Decline
            [0.0, 0.0, 1.0]   # Decline -> Decline (Absorbing)
        ])
        
        self.emission_means = emission_means
        self.emission_covs = emission_covs
        
        # Start in Growth
        self.pi = initial_probs if initial_probs is not None else np.array([1.0, 0.0, 0.0])

    def emission_probability(self, observation, state_idx):
        mean = self.emission_means[state_idx]
        cov = self.emission_covs[state_idx]
        # Add small noise to cov to prevent singular matrix errors
        safe_cov = cov + np.eye(len(mean)) * 1e-6
        return multivariate_normal.pdf(observation, mean=mean, cov=safe_cov)

    def get_state_name(self, idx):
        return self.states[idx]