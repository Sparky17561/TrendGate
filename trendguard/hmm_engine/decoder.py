import numpy as np

def viterbi_gaussian(model, observations):
    """
    Finds the most likely sequence of states for the given data.
    """
    T = observations.shape[0]
    N = model.n_states
    
    # log_delta[t, i] = max probability of ending in state i at time t
    log_delta = np.zeros((T, N))
    psi = np.zeros((T, N), dtype=int)
    
    # 1. Initialization (Use Log to avoid underflow)
    log_pi = np.log(model.pi + 1e-10)
    
    for i in range(N):
        emit_p = model.emission_probability(observations[0], i)
        log_delta[0, i] = log_pi[i] + np.log(emit_p + 1e-10)
    
    # 2. Recursion
    log_A = np.log(model.A + 1e-10)
    
    for t in range(1, T):
        for j in range(N):
            emit_p = np.log(model.emission_probability(observations[t], j) + 1e-10)
            
            # Find best transition from previous step
            vals = []
            for i in range(N):
                vals.append(log_delta[t-1, i] + log_A[i, j])
            
            psi[t, j] = np.argmax(vals)
            log_delta[t, j] = np.max(vals) + emit_p
            
    # 3. Termination
    path = np.zeros(T, dtype=int)
    path[T-1] = np.argmax(log_delta[T-1])
    
    # 4. Backtracking
    for t in range(T-2, -1, -1):
        path[t] = psi[t+1, path[t+1]]
        
    return [model.get_state_name(i) for i in path]