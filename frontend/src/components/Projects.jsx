import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const Projects = () => {

    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchProjects = async () => {
            try {
                
                const token = localStorage.getItem('token');
                if(!token || !user) {
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://localhost:3000/api/projects', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const transformedProjects = response.data.map(project => ({
                    id: project._id,
                    name: project.name,
                    color: project.color
                }));

                setProjects(transformedProjects);
                console.log(transformedProjects);

            } catch (error) {   
                console.log('Error fetching projects', error)
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();

    }, [user])

    return (
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-lg p-8 w-1/2 max-w-2xl min-w-[350px] w-full">
            <h2 className="text-xl font-inter-bold mb-8">My projects</h2>
            {loading ? (<div className="text-center text-white/60">Loading projects...</div>
            ) : !user ? (<div className="text-center text-white/60">Please log in to view your projects.</div>
            ) : (
                <ul className="space-y-6">
                    {projects.map(project => (
                        <li key={project.id}>
                            <div
                                className="rounded-lg p-4 shadow-md text-black font-semibold"
                                style={{ backgroundColor: '#' + project.color }}
                            >
                                {project.name}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default Projects;