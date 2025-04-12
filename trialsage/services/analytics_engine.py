# /services/analytics_engine.py
import os
import json
import uuid
import time
from typing import Dict, List, Any, Optional
from datetime import datetime

# Check if OpenAI API key is available
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
HF_API_KEY = os.environ.get("HF_API_KEY")

# Track conversation threads
active_threads = {}


async def create_thread():
    """Create a new conversation thread with a unique ID"""
    thread_id = f"thread_{uuid.uuid4().hex[:8]}"
    active_threads[thread_id] = {
        "created_at": datetime.now().isoformat(),
        "messages": [],
        "context": {
            "indication": None,
            "phase": None,
            "filters": {},
            "last_query": None,
            "last_visualization": None
        }
    }
    return thread_id


async def add_message_to_thread(thread_id: str, role: str, content: str, metadata: Optional[Dict] = None):
    """Add a message to a conversation thread"""
    if thread_id not in active_threads:
        thread_id = await create_thread()
        
    active_threads[thread_id]["messages"].append({
        "role": role,
        "content": content,
        "timestamp": datetime.now().isoformat(),
        "metadata": metadata or {}
    })
    return thread_id


async def get_thread_messages(thread_id: str):
    """Get all messages from a conversation thread"""
    if thread_id not in active_threads:
        return []
    return active_threads[thread_id]["messages"]


async def update_thread_context(thread_id: str, context_updates: Dict):
    """Update the context for a conversation thread"""
    if thread_id not in active_threads:
        thread_id = await create_thread()
        
    active_threads[thread_id]["context"].update(context_updates)
    return thread_id


async def get_thread_context(thread_id: str):
    """Get the context for a conversation thread"""
    if thread_id not in active_threads:
        return {}
    return active_threads[thread_id]["context"]


async def process_query(query: str, thread_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Process a natural language analytics query through the OpenAI API
    
    Args:
        query: The natural language query to process
        thread_id: Optional thread ID for conversation continuity
        
    Returns:
        dict: Contains the processed response with answer, visualization data, and context
    """
    # Create or retrieve thread
    if not thread_id:
        thread_id = await create_thread()
    elif thread_id not in active_threads:
        thread_id = await create_thread()
        
    # Add user query to thread
    await add_message_to_thread(thread_id, "user", query)
    
    try:
        # Get conversation context
        context = await get_thread_context(thread_id)
        
        # In a production environment, this would call the OpenAI API
        # For now, we'll simulate a response
        
        # Determine response based on query content
        response = {}
        
        if "obesity" in query.lower():
            response = {
                "answer": "I can help you design a clinical trial for obesity. Based on our database of successful Clinical Study Reports, I recommend considering the following design elements for obesity studies:\n\n1. Patient population: Adults with BMI ≥ 30 kg/m²\n2. Primary endpoint: Change in body weight from baseline\n3. Secondary endpoints: Change in waist circumference, BMI, and quality of life measures\n4. Study duration: 26-52 weeks\n5. Sample size: 150-300 participants based on expected effect size",
                "visualization": {
                    "type": "bar",
                    "title": "Success Rates by Endpoint in Obesity Trials",
                    "data": {
                        "labels": ["Weight Loss", "BMI Change", "Waist Circumference", "QoL"],
                        "datasets": [{
                            "data": [75, 68, 62, 45],
                            "backgroundColor": ["#4285F4", "#34A853", "#FBBC05", "#EA4335"]
                        }]
                    }
                },
                "insights": [
                    "Weight loss is the most successful primary endpoint",
                    "Quality of life measures show lower success rates but are valuable secondary endpoints",
                    "Studies with 26+ weeks duration show higher regulatory success"
                ],
                "related_questions": [
                    "What is the optimal sample size for Phase III obesity trials?",
                    "What inclusion/exclusion criteria are most common in successful obesity trials?",
                    "What adverse events are most common in obesity trials?"
                ]
            }
        elif "nash" in query.lower():
            response = {
                "answer": "For NASH (Non-alcoholic Steatohepatitis) clinical trials, our CSR analysis shows these key design elements:\n\n1. Primary endpoints: Histological improvement without worsening of fibrosis\n2. Secondary endpoints: Resolution of NASH, fibrosis improvement, NAS score reduction\n3. Study duration: Typically 48-72 weeks\n4. Biopsy confirmation: Required at baseline and end of treatment\n5. Sample size: 200-400 patients depending on phase and endpoints",
                "visualization": {
                    "type": "bar",
                    "title": "NASH Trial Success Factors",
                    "data": {
                        "labels": ["Histological Endpoints", "Fibrosis Endpoints", "Biomarker Endpoints", "Imaging Endpoints"],
                        "datasets": [{
                            "data": [68, 57, 41, 39],
                            "backgroundColor": ["#4285F4", "#34A853", "#FBBC05", "#EA4335"]
                        }]
                    }
                },
                "insights": [
                    "Histological endpoints remain the gold standard for pivotal NASH trials",
                    "Trials with paired biopsies show higher regulatory success",
                    "Combination of histological and non-invasive endpoints increases chance of success"
                ],
                "related_questions": [
                    "What are the typical inclusion criteria for NASH studies?",
                    "How are non-invasive biomarkers being used in NASH trials?",
                    "What is the optimal biopsy timing in NASH trials?"
                ]
            }
        else:
            response = {
                "answer": "I can help you design clinical trials based on insights from successful historical CSRs. Please specify what indication or aspect of trial design you'd like advice on. For example, you could ask about optimal endpoints for specific indications, sample size recommendations, or study duration patterns.",
                "insights": [
                    "Our database contains CSRs across multiple therapeutic areas",
                    "We can provide evidence-based recommendations on study design",
                    "Historical CSR analysis can help optimize your protocol"
                ],
                "related_questions": [
                    "What are the most successful endpoints for Phase II oncology trials?",
                    "What sample size is recommended for NASH studies?",
                    "What inclusion/exclusion criteria are most effective for Alzheimer's trials?"
                ]
            }
            
        # Add assistant response to thread
        await add_message_to_thread(thread_id, "assistant", response["answer"])
        
        # Update thread context
        if "visualization" in response:
            await update_thread_context(thread_id, {
                "last_visualization": response["visualization"]
            })
            
        # Add thread_id to response
        response["thread_id"] = thread_id
        response["data_points"] = 693  # Number of CSRs in database
        response["context"] = context
        
        return response
        
    except Exception as e:
        # Log the error (would be more robust in production)
        print(f"Error in process_query: {str(e)}")
        
        # Return an error response
        error_response = {
            "answer": f"I apologize, but I encountered an error while processing your query: \"{query}\". Please try again with a more specific question about clinical trial design.",
            "thread_id": thread_id
        }
        
        # Add error response to thread
        await add_message_to_thread(thread_id, "assistant", error_response["answer"])
        
        return error_response


async def generate_prediction(
    indication: str,
    phase: Optional[str] = None,
    sample_size: Optional[int] = None,
    duration_weeks: Optional[int] = None,
    endpoints: Optional[List[str]] = None,
    comparator: Optional[str] = None,
    thread_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate prediction analysis for trial outcomes
    
    Args:
        indication: The medical indication/condition for the prediction
        phase: Clinical trial phase (I, II, III, IV)
        sample_size: Number of patients in the trial
        duration_weeks: Duration of the trial in weeks
        endpoints: List of trial endpoints
        comparator: Comparator/control type (placebo, active, etc.)
        thread_id: Optional thread ID for conversation continuity
        
    Returns:
        dict: Contains prediction results, success probability, and confidence metrics
    """
    # Create or retrieve thread
    if not thread_id:
        thread_id = await create_thread()
    elif thread_id not in active_threads:
        thread_id = await create_thread()
    
    # Update thread context
    await update_thread_context(thread_id, {
        "indication": indication,
        "phase": phase
    })
    
    # In a production environment, this would run a real prediction model
    # For now, we'll simulate a response
    
    # Basic simulation based on input parameters
    success_probability = 0.65  # Base probability
    
    if phase:
        # Adjust for phase
        phase_factors = {"I": 0.1, "II": -0.05, "III": -0.1, "IV": 0.15}
        success_probability += phase_factors.get(phase, 0)
    
    if sample_size:
        # Adjust for sample size
        if sample_size < 100:
            success_probability -= 0.1
        elif sample_size > 300:
            success_probability += 0.1
    
    if duration_weeks:
        # Adjust for duration
        if duration_weeks < 12:
            success_probability -= 0.05
        elif duration_weeks > 52:
            success_probability += 0.05
    
    # Ensure probability is within bounds
    success_probability = max(0.1, min(0.95, success_probability))
    
    # Generate confidence value
    confidence = 0.85  # High confidence for most predictions
    
    # Simulate risk factors based on inputs
    risk_factors = []
    
    if sample_size and sample_size < 100:
        risk_factors.append("Small sample size may reduce statistical power")
    
    if duration_weeks and duration_weeks < 12:
        risk_factors.append("Short study duration may not capture long-term outcomes")
    
    if not endpoints or len(endpoints) < 2:
        risk_factors.append("Limited endpoint selection may miss important outcomes")
    
    # Generate optimization suggestions
    optimization_suggestions = []
    
    if sample_size and sample_size < 100:
        optimization_suggestions.append("Consider increasing sample size to improve statistical power")
    
    if not comparator:
        optimization_suggestions.append("Adding an active comparator arm may strengthen evidence")
    
    if not endpoints or len(endpoints) < 3:
        optimization_suggestions.append("Add secondary endpoints to capture broader outcomes")
    
    # Create the prediction response
    response = {
        "prediction": {
            "outcome": "success" if success_probability > 0.5 else "failure",
            "indication": indication,
            "phase": phase,
            "sample_size": sample_size,
            "duration_weeks": duration_weeks,
            "endpoints": endpoints or [],
            "comparator": comparator
        },
        "success_probability": success_probability,
        "confidence": confidence,
        "similar_trials": [
            {
                "id": "CSR-2035",
                "title": f"Phase {phase} Study of Drug X for {indication}",
                "success": True,
                "similarity_score": 0.87,
                "key_differences": ["Larger sample size", "Additional secondary endpoint"]
            },
            {
                "id": "CSR-1896",
                "title": f"Phase {phase} Study of Drug Y for {indication}",
                "success": True,
                "similarity_score": 0.82,
                "key_differences": ["Longer duration", "Different primary endpoint"]
            },
            {
                "id": "CSR-1452",
                "title": f"Phase {phase} Study of Drug Z for {indication}",
                "success": False,
                "similarity_score": 0.79,
                "key_differences": ["Smaller sample size", "No adaptive design"]
            }
        ],
        "thread_id": thread_id,
        "optimization_suggestions": optimization_suggestions,
        "risk_factors": risk_factors
    }
    
    return response


async def get_context_data(
    indication: Optional[str] = None,
    phase: Optional[str] = None,
    filter_params: Optional[Dict[str, Any]] = None,
    thread_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get contextual data for analytics queries
    
    Args:
        indication: Optional filter by indication
        phase: Optional filter by clinical trial phase
        filter_params: Additional filter parameters
        thread_id: Optional thread ID for conversation context
        
    Returns:
        dict: Contains contextual data for the current analytics session
    """
    # Create or retrieve thread
    if not thread_id:
        thread_id = await create_thread()
    elif thread_id not in active_threads:
        thread_id = await create_thread()
    
    # In a production environment, this would query the database
    # For now, we'll simulate a response
    
    # Create contextual data response
    response = {
        "context": {
            "current_filters": {
                "indication": indication,
                "phase": phase,
                **(filter_params or {})
            },
            "data_snapshot": {
                "timestamp": datetime.now().isoformat(),
                "source": "TrialSage CSR Database"
            }
        },
        "available_filters": {
            "indications": [
                "NASH", "Obesity", "Alzheimer's Disease", "Parkinson's", "Type 2 Diabetes", 
                "Psoriasis", "Rheumatoid Arthritis", "COPD", "Asthma", "Heart Failure"
            ],
            "phases": ["I", "II", "III", "IV"],
            "study_types": ["Interventional", "Observational"],
            "years": [str(year) for year in range(2010, 2023)],
            "sponsors": [
                "Pfizer", "Novartis", "Roche", "Merck", "AstraZeneca", 
                "Janssen", "Eli Lilly", "Bristol-Myers Squibb", "Sanofi", "GlaxoSmithKline"
            ]
        },
        "summary_metrics": {
            "total_trials": 693,
            "success_rate": 0.48,
            "median_duration_weeks": 26,
            "median_sample_size": 250,
            "top_endpoints": ["Change from baseline", "Response rate", "Event-free survival"]
        },
        "thread_id": thread_id,
        "cohort_size": 693,  # Full database if no filters
        "timeframe": {
            "start": "2010-01-01",
            "end": "2023-12-31"
        }
    }
    
    # Adjust cohort size based on filters
    if indication:
        # Simulate filtered cohort size
        response["cohort_size"] = 42  # Example for a specific indication
        
    if phase:
        # Further reduce cohort size for more specific filter
        response["cohort_size"] = max(12, response["cohort_size"] // 2)
    
    # Update thread context
    await update_thread_context(thread_id, {
        "indication": indication,
        "phase": phase,
        "filters": filter_params or {}
    })
    
    return response


async def generate_visualization(
    visualization_type: str,
    params: Dict[str, Any],
    thread_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate visualization data for analytics UI
    
    Args:
        visualization_type: Type of visualization (bar, line, scatter, heatmap, etc.)
        params: Parameters for the visualization
        thread_id: Optional thread ID for conversation context
        
    Returns:
        dict: Contains visualization data, labels, and insights
    """
    # Create or retrieve thread
    if not thread_id:
        thread_id = await create_thread()
    elif thread_id not in active_threads:
        thread_id = await create_thread()
    
    # In a production environment, this would query the database
    # For now, we'll simulate a response
    
    # Process visualization parameters
    indication = params.get("indication")
    phase = params.get("phase")
    metric = params.get("metric", "success_rate")
    comparison = params.get("comparison", "indication")
    
    # Create visualization response based on type
    response = {
        "thread_id": thread_id,
        "title": "Clinical Trial Metrics",
        "subtitle": "Based on CSR Database Analysis",
        "axis_labels": {
            "x": "Categories",
            "y": "Values"
        }
    }
    
    if visualization_type == "bar":
        # Generate bar chart data
        response.update({
            "data": {
                "labels": ["Category A", "Category B", "Category C", "Category D", "Category E"],
                "datasets": [{
                    "label": "Success Rate",
                    "data": [0.65, 0.48, 0.72, 0.53, 0.61],
                    "backgroundColor": "#4285F4"
                }]
            },
            "insights": [
                "Category C shows the highest success rate at 72%",
                "The average success rate across categories is 60%",
                "Categories with rates above 65% are considered high-performing"
            ]
        })
        
    elif visualization_type == "line":
        # Generate line chart data
        response.update({
            "data": {
                "labels": ["2018", "2019", "2020", "2021", "2022", "2023"],
                "datasets": [{
                    "label": "Trial Count",
                    "data": [42, 51, 63, 78, 89, 95],
                    "borderColor": "#34A853",
                    "fill": False
                }]
            },
            "insights": [
                "Trial count has shown consistent annual growth",
                "The CAGR over the period is approximately 18%",
                "The most significant growth occurred between 2020 and 2021"
            ]
        })
        
    elif visualization_type == "scatter":
        # Generate scatter plot data
        response.update({
            "data": {
                "datasets": [{
                    "label": "Sample Size vs. Success Rate",
                    "data": [
                        {"x": 120, "y": 0.45},
                        {"x": 180, "y": 0.52},
                        {"x": 250, "y": 0.61},
                        {"x": 320, "y": 0.68},
                        {"x": 380, "y": 0.71},
                        {"x": 450, "y": 0.75},
                        {"x": 520, "y": 0.77}
                    ],
                    "backgroundColor": "#FBBC05"
                }]
            },
            "insights": [
                "Positive correlation between sample size and success rate",
                "Success rate plateaus above 400 participants",
                "Optimal cost-effectiveness appears in the 300-400 sample size range"
            ]
        })
        
    elif visualization_type == "heatmap":
        # Generate heatmap data
        response.update({
            "data": {
                "labels": {
                    "x": ["Endpoint A", "Endpoint B", "Endpoint C", "Endpoint D"],
                    "y": ["Phase I", "Phase II", "Phase III", "Phase IV"]
                },
                "values": [
                    [0.72, 0.65, 0.58, 0.63],
                    [0.65, 0.58, 0.52, 0.48],
                    [0.58, 0.52, 0.45, 0.42],
                    [0.68, 0.62, 0.55, 0.59]
                ]
            },
            "insights": [
                "Endpoint A shows highest success rates across all phases",
                "Phase III shows the lowest overall success rates",
                "The combination of Endpoint A and Phase I shows the highest success rate"
            ]
        })
    
    else:
        # Default visualization data
        response.update({
            "data": {
                "labels": ["Category 1", "Category 2", "Category 3", "Category 4", "Category 5"],
                "values": [25, 38, 42, 35, 30]
            },
            "insights": [
                "Category 3 shows the highest value at 42",
                "The average value across categories is 34",
                "Categories 2, 3, and 4 account for 68% of the total value"
            ]
        })
    
    # Update thread context
    await update_thread_context(thread_id, {
        "last_visualization": {
            "type": visualization_type,
            "params": params
        }
    })
    
    return response


async def get_csr_drill_data(
    study_id: str,
    section: Optional[str] = None,
    thread_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get detailed CSR data for drill-down analysis
    
    Args:
        study_id: The ID of the study to drill into
        section: Optional specific section to retrieve (endpoints, adverse_events, etc.)
        thread_id: Optional thread ID for conversation context
        
    Returns:
        dict: Contains detailed CSR data for analysis
    """
    # Create or retrieve thread
    if not thread_id:
        thread_id = await create_thread()
    elif thread_id not in active_threads:
        thread_id = await create_thread()
    
    # In a production environment, this would query the database
    # For now, we'll simulate a response
    
    # Generate basic study info
    study_info = {
        "id": study_id,
        "title": f"A Phase {'III' if 'III' in study_id else 'II'} Study of Drug X in Patients with Condition Y",
        "sponsor": "Pharmaceutical Company Z",
        "indication": "Condition Y",
        "phase": "III" if "III" in study_id else "II",
        "status": "Completed",
        "start_date": "2019-03-15",
        "end_date": "2021-09-30",
        "sample_size": 342,
        "arms": [
            {"name": "Treatment Arm", "description": "Drug X 10mg once daily", "size": 171},
            {"name": "Control Arm", "description": "Placebo once daily", "size": 171}
        ]
    }
    
    # Generate section-specific data
    section_data = {}
    
    if not section or section == "overview":
        section_data = {
            "objectives": {
                "primary": "To evaluate the efficacy of Drug X compared to placebo in patients with Condition Y",
                "secondary": [
                    "To evaluate the safety and tolerability of Drug X",
                    "To evaluate the pharmacokinetics of Drug X",
                    "To evaluate the impact of Drug X on quality of life measures"
                ]
            },
            "design": "Randomized, double-blind, placebo-controlled, parallel-group, multi-center study",
            "population": "Adult patients aged 18-75 with confirmed diagnosis of Condition Y",
            "duration": "24 weeks of treatment followed by 4 weeks of follow-up",
            "key_inclusion": [
                "Confirmed diagnosis of Condition Y for at least 6 months",
                "Inadequate response to standard therapy",
                "ECOG performance status 0-1"
            ],
            "key_exclusion": [
                "Prior treatment with Drug X or similar agents",
                "Significant comorbidities that could interfere with the evaluation",
                "Pregnancy or breastfeeding"
            ]
        }
    elif section == "endpoints":
        section_data = {
            "primary_endpoint": {
                "definition": "Change from baseline in Score X at Week 24",
                "result": "Statistically significant improvement compared to placebo (p<0.001)",
                "success": True
            },
            "secondary_endpoints": [
                {
                    "definition": "Proportion of patients achieving Score X reduction ≥30% at Week 24",
                    "result": "48.5% vs 25.1% for placebo (p<0.001)",
                    "success": True
                },
                {
                    "definition": "Change from baseline in Quality of Life score at Week 24",
                    "result": "Statistically significant improvement compared to placebo (p=0.023)",
                    "success": True
                },
                {
                    "definition": "Time to first Score X worsening event",
                    "result": "Hazard ratio 0.65 (95% CI: 0.48, 0.87; p=0.004)",
                    "success": True
                }
            ]
        }
    elif section == "adverse_events":
        section_data = {
            "summary": {
                "any_ae": {"treatment": 78.4, "placebo": 65.5},
                "serious_ae": {"treatment": 8.2, "placebo": 7.6},
                "severe_ae": {"treatment": 5.3, "placebo": 4.7},
                "discontinuation_due_to_ae": {"treatment": 4.1, "placebo": 3.5}
            },
            "most_common": [
                {"name": "Headache", "treatment": 15.2, "placebo": 12.3},
                {"name": "Nausea", "treatment": 12.9, "placebo": 8.2},
                {"name": "Fatigue", "treatment": 10.5, "placebo": 9.4},
                {"name": "Upper respiratory infection", "treatment": 8.8, "placebo": 9.9},
                {"name": "Dizziness", "treatment": 7.6, "placebo": 5.3}
            ],
            "serious_events": [
                {"name": "Pneumonia", "treatment": 1.8, "placebo": 1.2},
                {"name": "Deep vein thrombosis", "treatment": 0.6, "placebo": 0.6},
                {"name": "Myocardial infarction", "treatment": 0.6, "placebo": 1.2}
            ]
        }
    elif section == "efficacy":
        section_data = {
            "primary_analysis": {
                "method": "Mixed Model Repeated Measures (MMRM)",
                "population": "Intent-to-treat (ITT)",
                "results": {
                    "treatment_change": -15.8,
                    "placebo_change": -6.3,
                    "difference": -9.5,
                    "ci_95": [-12.7, -6.3],
                    "p_value": "<0.001"
                }
            },
            "subgroup_analyses": [
                {"subgroup": "Age <65", "treatment_effect": -10.2, "p_value": "<0.001"},
                {"subgroup": "Age ≥65", "treatment_effect": -8.7, "p_value": "0.003"},
                {"subgroup": "Male", "treatment_effect": -9.8, "p_value": "<0.001"},
                {"subgroup": "Female", "treatment_effect": -9.2, "p_value": "<0.001"},
                {"subgroup": "Prior therapy: Yes", "treatment_effect": -8.9, "p_value": "0.002"},
                {"subgroup": "Prior therapy: No", "treatment_effect": -10.1, "p_value": "<0.001"}
            ],
            "sensitivity_analyses": [
                {"analysis": "Per-protocol population", "treatment_effect": -9.8, "p_value": "<0.001"},
                {"analysis": "LOCF imputation", "treatment_effect": -9.1, "p_value": "<0.001"},
                {"analysis": "Multiple imputation", "treatment_effect": -9.3, "p_value": "<0.001"}
            ]
        }
    elif section == "conclusions":
        section_data = {
            "efficacy": "Drug X demonstrated statistically significant and clinically meaningful improvement in Score X compared to placebo at Week 24.",
            "safety": "Drug X was generally well-tolerated with a safety profile consistent with the known pharmacology of the drug class.",
            "benefit_risk": "The benefit-risk assessment favors Drug X for the treatment of Condition Y in adult patients.",
            "implications": "Results support the use of Drug X as a new treatment option for patients with Condition Y who have inadequate response to standard therapy."
        }
    
    # Create the CSR drill response
    response = {
        **study_info,
        "data": section_data,
        "thread_id": thread_id,
        "similar_studies": [
            {"id": "CSR-2876", "title": "Phase III Study of Drug A in Condition Y", "similarity": 0.89},
            {"id": "CSR-3142", "title": "Phase III Study of Drug B in Condition Y", "similarity": 0.85},
            {"id": "CSR-2591", "title": "Phase II Study of Drug X in Condition Z", "similarity": 0.78}
        ],
        "citations": [
            {"text": "Smith et al. (2022). Results of a Phase III trial of Drug X in Condition Y. Journal of Medical Research, 45(3), 287-295."},
            {"text": "Johnson et al. (2021). Safety profile of Drug X across clinical development program. Clinical Therapeutics, 38(2), 112-124."}
        ],
        "insights": [
            "This study achieved its primary endpoint with strong statistical significance",
            "The safety profile was consistent with other studies in this therapeutic area",
            "Subgroup analyses showed consistent treatment effect across demographics"
        ]
    }
    
    # Update thread context
    await update_thread_context(thread_id, {
        "last_csr_drill": {
            "study_id": study_id,
            "section": section
        }
    })
    
    return response