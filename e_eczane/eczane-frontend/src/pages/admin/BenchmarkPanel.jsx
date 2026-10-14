import React, { useState } from 'react';
import { Zap, Play, Trophy, Clock, Server, Globe, Info, TrendingUp, ArrowRight, BarChart3 } from 'lucide-react';
import * as cosmosApi from '../../api/cosmosApi';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const BenchmarkPanel = () => {
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [running, setRunning] = useState(false);

  const handleRunBenchmark = async () => {
    setRunning(true);
    setBenchmarkData(null);
    try {
      const data = await cosmosApi.runBenchmark();
      setBenchmarkData(data);
      toast.success('Benchmark tamamlandı!');
    } catch (err) {
      toast.error('Benchmark çalıştırılırken hata oluştu');
    } finally {
      setRunning(false);
    }
  };

  const maxMs = benchmarkData
    ? Math.max(...benchmarkData.results.flatMap(r => [r.postgresql_ms, r.dynamodb_ms]))
    : 1;

  const getBarWidth = (ms) => Math.max(((ms / maxMs) * 100), 3);

  const explanations = {
    "Tekli Yazma (Single Write)": {
      pg: "PostgreSQL: INSERT komutu ile B-Tree index güncelleme + WAL log yazımı.",
      dyn: "DynamoDB: put_item ile hash partition'a doğrudan yazım. Ağ gecikmesi baskın faktör.",
      insight: "Lokal PostgreSQL disk I/O avantajına sahipken, DynamoDB her yazımda AWS bulut sunucusuna HTTP isteği gönderir."
    },
    "Tekli Okuma (Single Read)": {
      pg: "PostgreSQL: B-Tree index üzerinden O(log n) arama.",
      dyn: "DynamoDB: Hash-based partition key ile O(1) doğrudan erişim.",
      insight: "DynamoDB'nin hash tabanlı yapısı teoride O(1) erişim sağlar, ancak ağ gecikmesi bu avantajı gölgeleyebilir."
    },
    "Toplu Tarama (Full Scan)": {
      pg: "PostgreSQL: Sequential scan veya index-only scan ile COUNT optimizasyonu.",
      dyn: "DynamoDB: Full table scan — tüm partition'ları tarar, NoSQL için pahalı bir operasyon.",
      insight: "SQL veritabanları toplama (aggregation) işlemlerinde doğal olarak güçlüdür. DynamoDB scan operasyonu anti-pattern olarak kabul edilir."
    },
    "Tekli Silme (Single Delete)": {
      pg: "PostgreSQL: MVCC ile soft-delete + vacuum ile temizlik.",
      dyn: "DynamoDB: Partition key ile doğrudan silme, ağ gecikmesi baskın.",
      insight: "Her iki veritabanı da PK ile silmede verimlidir. Fark büyük ölçüde ağ gecikmesinden kaynaklanır."
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-lg shadow-lg shadow-orange-500/20">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">PostgreSQL vs DynamoDB — Hız Karşılaştırması</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">4 farklı operasyonda gerçek zamanlı performans benchmark'ı</p>
          </div>
          <Button onClick={handleRunBenchmark} disabled={running} className="gap-2">
            {running ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Test Çalışıyor...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Benchmark Başlat
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        {!benchmarkData && !running && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-50 mb-4">
              <BarChart3 className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">Benchmark'ı başlatmak için yukarıdaki butona tıklayın</p>
            <p className="text-slate-400 text-xs mt-1">Her iki veritabanında 4 farklı operasyon test edilecektir</p>
          </div>
        )}

        {running && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-100 to-orange-50 mb-4 animate-pulse">
              <Zap className="w-8 h-8 text-amber-500" />
            </div>
            <p className="text-slate-700 font-semibold">Benchmark çalışıyor...</p>
            <p className="text-slate-400 text-xs mt-1">PostgreSQL ve DynamoDB'ye test istekleri gönderiliyor</p>
          </div>
        )}

        {benchmarkData && (
          <div className="space-y-6">
            {/* DB Info Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50/70 border border-blue-100">
                <div className="p-2.5 bg-blue-600 rounded-xl"><Server className="w-5 h-5 text-white" /></div>
                <div>
                  <h4 className="font-bold text-blue-900 text-sm">PostgreSQL</h4>
                  <p className="text-xs text-blue-600">{benchmarkData.postgresql_info.type} • {benchmarkData.postgresql_info.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-50/70 border border-orange-100">
                <div className="p-2.5 bg-orange-500 rounded-xl"><Globe className="w-5 h-5 text-white" /></div>
                <div>
                  <h4 className="font-bold text-orange-900 text-sm">AWS DynamoDB</h4>
                  <p className="text-xs text-orange-600">{benchmarkData.dynamodb_info.type} • {benchmarkData.dynamodb_info.location}</p>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-5">
              {benchmarkData.results.map((r, idx) => {
                const exp = explanations[r.operation] || {};
                const pgFaster = r.winner === 'PostgreSQL';
                return (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-800 text-sm">{r.operation}</h4>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${pgFaster ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        <Trophy className="w-3 h-3" />
                        {r.winner} %{r.difference_pct} daha hızlı
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">{r.description}</p>

                    {/* Bar Chart */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3">
                        <span className="w-24 text-xs font-semibold text-blue-700 text-right shrink-0">PostgreSQL</span>
                        <div className="flex-1 bg-slate-200/60 rounded-full h-7 overflow-hidden relative">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-end pr-2 transition-all duration-1000 ease-out"
                            style={{ width: `${getBarWidth(r.postgresql_ms)}%` }}
                          >
                            <span className="text-[10px] font-bold text-white drop-shadow">{r.postgresql_ms} ms</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-24 text-xs font-semibold text-orange-700 text-right shrink-0">DynamoDB</span>
                        <div className="flex-1 bg-slate-200/60 rounded-full h-7 overflow-hidden relative">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-end pr-2 transition-all duration-1000 ease-out"
                            style={{ width: `${getBarWidth(r.dynamodb_ms)}%` }}
                          >
                            <span className="text-[10px] font-bold text-white drop-shadow">{r.dynamodb_ms} ms</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SQL Commands */}
                    <div className="grid sm:grid-cols-2 gap-2 mt-3">
                      <div className="px-3 py-1.5 rounded-lg bg-blue-50 text-xs text-blue-700 font-mono">{r.pg_operation}</div>
                      <div className="px-3 py-1.5 rounded-lg bg-orange-50 text-xs text-orange-700 font-mono">{r.dynamo_operation}</div>
                    </div>

                    {/* Technical Explanation */}
                    {exp.insight && (
                      <div className="mt-3 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
                        <div className="flex items-start gap-2">
                          <Info className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                          <div className="text-xs text-indigo-700 space-y-1">
                            <p>{exp.pg}</p>
                            <p>{exp.dyn}</p>
                            <p className="font-semibold">{exp.insight}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-lg">Benchmark Özeti</h4>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div className="p-3 rounded-xl bg-white/10">
                  <p className="text-xs text-slate-400 mb-1">PostgreSQL Toplam</p>
                  <p className="text-xl font-bold text-blue-400">{benchmarkData.summary.postgresql_total_ms} ms</p>
                  <p className="text-xs text-slate-500">{benchmarkData.summary.postgresql_wins} test kazandı</p>
                </div>
                <div className="p-3 rounded-xl bg-white/10">
                  <p className="text-xs text-slate-400 mb-1">DynamoDB Toplam</p>
                  <p className="text-xl font-bold text-orange-400">{benchmarkData.summary.dynamodb_total_ms} ms</p>
                  <p className="text-xs text-slate-500">{benchmarkData.summary.dynamodb_wins} test kazandı</p>
                </div>
                <div className="p-3 rounded-xl bg-white/10">
                  <p className="text-xs text-slate-400 mb-1">Genel Kazanan</p>
                  <p className={`text-xl font-bold ${benchmarkData.summary.overall_winner === 'PostgreSQL' ? 'text-blue-400' : 'text-orange-400'}`}>
                    {benchmarkData.summary.overall_winner}
                  </p>
                  <p className="text-xs text-slate-500">Toplam süre bazında</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-300 leading-relaxed">{benchmarkData.summary.note}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default BenchmarkPanel;
