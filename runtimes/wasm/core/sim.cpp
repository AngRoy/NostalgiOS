
#include <vector>
#include <emscripten/bind.h>
using namespace emscripten;
double dot(std::vector<double> a, std::vector<double> b){ double s=0; size_t n=a.size()<b.size()?a.size():b.size(); for(size_t i=0;i<n;++i) s+=a[i]*b[i]; return s; }
EMSCRIPTEN_BINDINGS(sim){ function("dot", &dot); register_vector<double>("VectorDouble"); }
